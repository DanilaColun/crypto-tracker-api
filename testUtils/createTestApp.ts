import { createApp } from '../src/http/createApp';
import { Logger } from '../src/logger/logger';
import { SQLiteCurrencyRepository } from '../src/repositories/sqliteCurrencyRepository';
import { CurrencyRepository } from '../src/repositories/currencyRepository';
import { SQLitePriceRepository } from '../src/repositories/sqlitePriceRepository';
import { PriceRepository } from '../src/repositories/priceRepository';
import { createTestDatabase } from './createTestDatabase';

interface CreateTestAppOptions {
  apiToken: string;
  currencyRepository?: CurrencyRepository;
  priceRepository?: PriceRepository;
}

export async function createTestApp(options: CreateTestAppOptions) {
  const testDatabase = await createTestDatabase();

  const currencyRepository =
    options.currencyRepository ?? new SQLiteCurrencyRepository({ db: testDatabase.db });

  const priceRepository =
    options.priceRepository ?? new SQLitePriceRepository({ db: testDatabase.db });

  const logger = new Logger('test', { level: 'error' });

  const app = createApp({
    logger,
    currencyRepository,
    priceRepository,
    apiToken: options.apiToken,
  });

  return {
    app,
    testDatabase,
    currencyRepository,
    priceRepository,
  };
}
