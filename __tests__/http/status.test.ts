import request from 'supertest';
import { createTestApp } from '../../testUtils/createTestApp';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

let testDatabase: { close: () => Promise<void> } | null = null;

describe('status route', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (testDatabase) {
      await testDatabase.close();
      testDatabase = null;
    }

    jest.restoreAllMocks();
  });

  test('returns ok', async () => {
    const testApp = await createTestApp({ apiToken: validToken });
    testDatabase = testApp.testDatabase;

    await request(testApp.app).get('/status').expect(200).expect('ok');
  });
});
