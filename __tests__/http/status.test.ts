import request from 'supertest';
import { Logger } from '../../src/logger/logger';
import { createApp } from '../../src/http/createApp';

describe('status route', () => {
  test('returns ok', async () => {
    const logger = new Logger('test', { level: 'error' });
    const app = createApp({ logger });

    await request(app).get('/status').expect(200).expect('ok');
  });
});
