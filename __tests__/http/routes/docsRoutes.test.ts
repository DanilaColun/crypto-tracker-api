import request from 'supertest';
import { createTestApp } from '../../../testUtils/createTestApp';

let testDatabase: { close: () => Promise<void> } | null = null;

async function buildApp() {
  const testApp = await createTestApp({ apiToken: 'test-token' });

  testDatabase = testApp.testDatabase;

  return testApp.app;
}

describe('docs routes', () => {
  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
      testDatabase = null;
    }
  });

  test('serves the openapi document', async () => {
    const app = await buildApp();

    const response = await request(app).get('/docs.json').expect(200);

    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.info.title).toBe('Crypto Tracker API');
    expect(response.body.paths['/api/currencies']).toBeDefined();
  });
});
