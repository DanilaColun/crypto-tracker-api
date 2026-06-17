# Crypto Tracker API

Финальный проект на Node.js и TypeScript. REST API для отслеживания криптовалют и адресов, получения курсов с Binance и чтения данных из блокчейна (высота сети и баланс адреса).

## О проекте

Это проект на Node.js и TypeScript, где реализовано:

1. Express web server (на TypeScript)
2. маршрут `/status` для проверки работы сервера
3. авторизация с помощью Bearer token из `.env`
4. CRUD API для `currency`
5. CRUD API для `address` (адреса в сетях BTC и ETH, + расширяемость)
6. хранение данных в SQLite 
7. endpoint `/price` — сохранённые курсы из SQLite где курсы берутся автоматически раз в минуту через scheduler
8. endpoint `/price/history` — сохранённая история курсов 
9. endpoint `/blockchain/height` — высота блока сети
10. endpoint `/blockchain/balance` — баланс адреса в сети
11. поддержка нескольких сетей (BTC, ETH) через общий интерфейс провайдера и реестр (новую сеть легко добавить + расширяемость)
12. retry и timeout при запросах к внешним API 
13. OpenAPI описание и Swagger UI
14. структура по принципу SoC и SOLID
15. модуль конфигурации приложения
16. кастомный логгер с уровнями логирования
17. кастомные ошибки 
18. scheduler для периодических задач (работает вместе с сервером)
19. graceful shutdown по SIGINT и SIGTERM
20. автотесты на Jest и Supertest
21. Repository Pattern и зависимость от интерфейсов
22. транзакции для write операций в SQLite
23. Docker и docker-compose

## Структура проекта

```text
src/config
настройки приложения

src/clients
HTTP клиент для внешних API и общий retry

src/blockchain
интерфейс провайдера и провайдеры BTC и ETH, реестр провайдеров

src/database
подключение SQLite и схема базы данных, транзакции и инициализация базы

src/docs
OpenAPI специфика

src/errors
кастомные ошибки

src/http/middlewares
middleware для auth, requestId, requestLogger и errors

src/http/routes
список Express routes

src/logger
кастомный logger

src/repositories
слой доступа к данным через Repository Pattern

src/scheduler
периодические задачи и запуск scheduler

src/services
бизнес логика приложения

src/types
расширение типов Express

src/validators
валидация входных данных

testUtils
помошник функции для тестовой SQLite базы и тестового приложения
```

## Основные endpoints

```text
GET    /status
GET    /docs
GET    /docs.json

GET    /api/currencies
POST   /api/currencies
GET    /api/currencies/:ticker
PUT    /api/currencies/:ticker
DELETE /api/currencies/:ticker

GET    /api/addresses
POST   /api/addresses
GET    /api/addresses/:id
PUT    /api/addresses/:id
DELETE /api/addresses/:id

GET    /price?currency=:ticker
GET    /price/history?currency=:ticker

GET    /blockchain/height?chain=:chain
GET    /blockchain/balance?chain=:chain&address=:address
```

## Авторизация

Все API endpoint защищены Bearer token через auth middleware.

Публичные endpoints:

```text
GET /status
GET /docs
GET /docs.json
```

Защищённые endpoints:

```text
/api/currencies
/api/addresses
/price
/blockchain
```

Пример заголовка:

```text
Authorization: Bearer <API_TOKEN>
```

`API_TOKEN` хранится в `.env`. Также есть пример токена в .env.example.

## Currency API

`currency` содержит два поля:

```json
{
  "name": "Bitcoin",
  "ticker": "BTC"
}
```

Данные хранятся в SQLite базе данных. 
После перезапуска сервера список `currency` сохраняется.

## Address API

Сущность `address` содержит сеть и адрес:

```json
{
  "id": 1,
  "chain": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

Поддерживаются сети `BTC` и `ETH`. Данные хранятся в SQLite. Одинаковый адрес в одной сети нельзя добавить дважды.

## Price API

Endpoint:

```text
GET /price?currency=:ticker
```

Возвращает сохраненные курсы из SQLite бд, не обращается напрямую к Binance, а курсы обновляются фоновой задачей раз в 1 минуту. Scheduler обращается к Binance API и сохраняет в бд.

Пример ответа:

```json
{
  "currency": "BTC",
  "prices": [
    {
      "symbol": "BTCUSDT",
      "price": "68000.00000000"
    },
    {
      "symbol": "ETHBTC",
      "price": "0.05200000"
    }
  ]
}
```

Все пары Binance, где в symbol встречается переданный ticker.

Перед чтением курсов приложение проверяет, что переданный `currency` есть в базе данных.

Если курсы ещё не были обновлены scheduler, endpoint вернёт пустой массив `prices`.

## Price history API

Endpoint:

```text
GET /price/history?currency=:ticker
```

Дополнительные параметры: `symbol` (фильтр по паре) и `limit` (сколько записей вернуть).

Возвращает сохранённую историю курсов, новые записи сверху. 
Каждый запуск scheduler добавляет новую запись (срез) в историю.

Пример ответа:

```json
{
  "currency": "BTC",
  "history": [
    {
      "symbol": "BTCUSDT",
      "price": "68000.00000000",
      "recordedAt": "2026-06-17T12:25:06.658Z"
    }
  ]
}
```

## Blockchain API

Два endpoint для данных сети:

```text
GET /blockchain/height?chain=:chain
GET /blockchain/balance?chain=:chain&address=:address
```

Поддерживаются сети `BTC` и `ETH`. Высота и баланс берутся из блокчейна (для BTC — mempool.space, для ETH — публичный JSON-RPC). Из Binance не получается, потому что это данные сети, а не биржи. Эргономичный вариант был именно таким. Также возможна расширяемость и возможность легко добавить новые сети. 

Пример ответа для высоты:

```json
{
  "chain": "BTC",
  "height": 954078
}
```

Пример ответа для баланса:

```json
{
  "chain": "BTC",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "balance": "5721254457",
  "unit": "satoshi"
}
```

Баланс возвращается строкой в единицах сети (satoshi для BTC, wei для ETH).

Если внешний сервис недоступен, сработает retry, а если не сработает то endpoint вернёт ошибку `502`. 

## Работа с базой данных

В проекте используется SQLite (без ORM).

По умолчанию база создаётся по пути:

```text
./data/app.sqlite
```

Файл базы данных не хранится в репозитории.

В базе хранятся `currency`, `address`, текущие курсы для `/price` и история курсов для `/price/history`.

Для создания базы и таблиц используется команда:

```bash
npm run db:init
```

## OpenAPI и Swagger

Документация доступна через Swagger UI:

```text
GET /docs
```

Сырая OpenAPI спецификация:

```text
GET /docs.json
```

Описаны endpoints, методы, параметры, ответы, схемы и авторизация. В Swagger UI можно нажать Authorize потом ввести токен и проверять прямо из браузера.

## Ошибки и логирование

Кастомные ошибки содержат:

```text
statusCode
timestamp
requestId
context
```

Логгер поддерживает уровни:

```text
error
warn
info
debug
trace
```

Пример лога:

```text
[2026-06-17T12:24:04.417Z] [INFO] [Crypto Tracker API] [requestId=scheduler-task] price update started
```

## Запуск

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

```bash
cp .env.example .env
```

В `.env` нужно указать свой API_TOKEN.

### Инициализация базы данных

```bash
npm run db:init
```

### Запуск в режиме разработки

```bash
npm run dev
```

(автоматически перезапускается при изменении кода)

### Запуск собранного приложения

```bash
npm run build
npm start
```

Выводом будет:

```text
[2026-06-17T12:24:04.408Z] [INFO] [Crypto Tracker API] [requestId=scheduler-task] scheduler started
[2026-06-17T12:24:04.412Z] [INFO] [Crypto Tracker API] [requestId=scheduler-task] price update started
[2026-06-17T12:24:04.417Z] [INFO] [Crypto Tracker API] app started on port 3000
```

(вместе со стартом запускаетя и фоновое обновление price раз в 1 минуту)

## Docker

В проекте есть `Dockerfile` и `docker-compose.yml`.

Запуск в Docker:

```bash
docker compose up --build
```

Приложение поднимется (порт 3000). Файл базы данных хранится в папке ./data на машине через volume поэтому не вшит в образ и переживает пересборку контейнера.

Остановить:

```bash
docker compose down
```

## Тестирование

Для тестирования используется Jest и Supertest.

Запуск тестов:

```bash
npm test
```

Запуск тестов с покрытием:

```bash
npm run test:coverage
```

В проекте тесты для:

```text
ошибок
logger
middlewares
scheduler
currency routes
address routes
price route
price history route
blockchain providers
blockchain service
blockchain routes
services
docs route
```

Для тестов используется временная база данных SQLite.

## Как добавить новую сеть

Чтобы добавить новую сеть достаточно реализовать для неё BlockchainProvider и зарегистрировать провайдер, не меняя сервисы и routes что добавляет простоты. 

## Скрипты

```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:init": "tsx src/database/initDatabase.ts",
  "test": "jest",
  "test:coverage": "jest --coverage"
}
```
