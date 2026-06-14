import request from 'supertest';
import { createApp } from '../../src/http/createApp';

describe('status route', () => {
  test('returns ok', async () => {
    const app = createApp();

    await request(app).get('/status').expect(200).expect('ok');
  });
});
