import request from 'supertest';
import { createTestApp } from '../../../testUtils/createTestApp';
import { BlockchainProvider } from '../../../src/blockchain/blockchainProvider';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

let testDatabase: { close: () => Promise<void> } | null = null;

const bitcoinProvider: BlockchainProvider = {
  chain: 'BTC',
  getHeight: async () => 840000,
  getBalance: async () => ({ address: 'bc1qexample', balance: '12345', unit: 'satoshi' }),
};

async function buildApp() {
  const testApp = await createTestApp({
    apiToken: validToken,
    blockchainProviders: [bitcoinProvider],
  });

  testDatabase = testApp.testDatabase;

  return testApp.app;
}

function withAuth(requestBuilder: request.Test) {
  return requestBuilder.set('Authorization', `Bearer ${validToken}`);
}

describe('blockchain routes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
      testDatabase = null;
    }

    jest.restoreAllMocks();
  });

  test('blocks request without token', async () => {
    const app = await buildApp();

    const response = await request(app).get('/blockchain/height?chain=BTC').expect(403);

    expect(response.body.error).toBe('Forbidden');
  });

  test('returns blockchain height', async () => {
    const app = await buildApp();

    await withAuth(request(app).get('/blockchain/height?chain=btc'))
      .expect(200)
      .expect({ chain: 'BTC', height: 840000 });
  });

  test('requires chain for height', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).get('/blockchain/height')).expect(400);

    expect(response.body.error).toBe('Chain is required');
  });

  test('returns 400 for unsupported chain', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).get('/blockchain/height?chain=DOGE')).expect(400);

    expect(response.body.error).toBe('Chain is not supported');
  });

  test('returns address balance', async () => {
    const app = await buildApp();

    await withAuth(request(app).get('/blockchain/balance?chain=BTC&address=bc1qexample'))
      .expect(200)
      .expect({ chain: 'BTC', address: 'bc1qexample', balance: '12345', unit: 'satoshi' });
  });

  test('requires address for balance', async () => {
    const app = await buildApp();

    const response = await withAuth(request(app).get('/blockchain/balance?chain=BTC')).expect(400);

    expect(response.body.error).toBe('Address is required');
  });
});
