import request from 'supertest';
import { createTestApp } from '../../../testUtils/createTestApp';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

let testDatabase: { close: () => Promise<void> } | null = null;

async function buildTestApp() {
  const testApp = await createTestApp({ apiToken: validToken });

  await testApp.currencyRepository.create({ name: 'Bitcoin', ticker: 'BTC' });

  await testApp.priceHistoryRepository.addForCurrencyTicker(
    'BTC',
    [{ symbol: 'BTCUSDT', price: '68000.00000000' }],
    '2026-06-16T10:00:00.000Z',
  );

  await testApp.priceHistoryRepository.addForCurrencyTicker(
    'BTC',
    [
      { symbol: 'BTCUSDT', price: '68500.00000000' },
      { symbol: 'ETHBTC', price: '0.05200000' },
    ],
    '2026-06-16T10:01:00.000Z',
  );

  return testApp;
}

function withAuth(requestBuilder: request.Test) {
  return requestBuilder.set('Authorization', `Bearer ${validToken}`);
}

describe('price history routes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
      testDatabase = null;
    }

    jest.restoreAllMocks();
  });

  test('blocks request without token', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await request(testApp.app).get('/price/history?currency=BTC').expect(403);

    expect(response.body.error).toBe('Forbidden');
  });

  test('returns full history for a currency', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(request(testApp.app).get('/price/history?currency=BTC')).expect(200);

    expect(response.body.currency).toBe('BTC');
    expect(response.body.history).toHaveLength(3);
  });

  test('returns history for one symbol newest first', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(
      request(testApp.app).get('/price/history?currency=BTC&symbol=BTCUSDT'),
    ).expect(200);

    expect(response.body.history).toHaveLength(2);
    expect(response.body.history[0].price).toBe('68500.00000000');
    expect(response.body.history[1].price).toBe('68000.00000000');
  });

  test('limits number of records', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(
      request(testApp.app).get('/price/history?currency=BTC&symbol=BTCUSDT&limit=1'),
    ).expect(200);

    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0].price).toBe('68500.00000000');
  });

  test('returns 400 if currency query is missing', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(request(testApp.app).get('/price/history')).expect(400);

    expect(response.body.error).toBe('Currency is required');
  });

  test('returns 400 if limit is not valid', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(
      request(testApp.app).get('/price/history?currency=BTC&limit=abc'),
    ).expect(400);

    expect(response.body.error).toBe('Limit must be a positive integer');
  });

  test('returns 404 if currency is not in database', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(request(testApp.app).get('/price/history?currency=DOGE')).expect(404);

    expect(response.body.error).toBe('Currency not found');
  });
});
