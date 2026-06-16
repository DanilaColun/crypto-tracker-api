import request from 'supertest';
import { createTestApp } from '../../../testUtils/createTestApp';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

let testDatabase: { close: () => Promise<void> } | null = null;

async function buildTestApp() {
  const testApp = await createTestApp({ apiToken: validToken });

  await testApp.currencyRepository.create({ name: 'Bitcoin', ticker: 'BTC' });

  await testApp.priceRepository.replaceForCurrencyTicker('BTC', [
    { symbol: 'BTCUSDT', price: '68000.00000000' },
    { symbol: 'ETHBTC', price: '0.05200000' },
  ]);

  return testApp;
}

function withAuth(requestBuilder: request.Test) {
  return requestBuilder.set('Authorization', `Bearer ${validToken}`);
}

describe('price routes', () => {
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

    const response = await request(testApp.app).get('/price?currency=BTC').expect(403);

    expect(response.body.error).toBe('Forbidden');
  });

  test('returns cached prices for currency', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    await withAuth(request(testApp.app).get('/price?currency=BTC'))
      .expect(200)
      .expect({
        currency: 'BTC',
        prices: [
          { symbol: 'BTCUSDT', price: '68000.00000000' },
          { symbol: 'ETHBTC', price: '0.05200000' },
        ],
      });
  });

  test('returns 400 if currency query is missing', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(request(testApp.app).get('/price')).expect(400);

    expect(response.body.error).toBe('Currency is required');
  });

  test('returns 404 if currency is not in database', async () => {
    const testApp = await buildTestApp();
    testDatabase = testApp.testDatabase;

    const response = await withAuth(request(testApp.app).get('/price?currency=ETH')).expect(404);

    expect(response.body.error).toBe('Currency not found');
  });
});
