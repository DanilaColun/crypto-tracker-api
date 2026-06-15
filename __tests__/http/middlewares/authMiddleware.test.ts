import express from 'express';
import request from 'supertest';
import { createAuthMiddleware } from '../../../src/http/middlewares/authMiddleware';
import { createErrorMiddleware } from '../../../src/http/middlewares/errorMiddleware';

const validToken = 'a9f4c2d8e13b7a0c91f6e84d22b0c5713e69f10ab8d4567c3f92a4410dc88b5e';

function createTestApp() {
  const app = express();

  app.get('/protected', createAuthMiddleware({ apiToken: validToken }), (req, res) => {
    res.status(200).json({ message: 'ok' });
  });

  app.use(createErrorMiddleware());

  return app;
}

describe('authMiddleware', () => {
  test('blocks request without token', async () => {
    const app = createTestApp();

    await request(app).get('/protected').expect(403).expect({ error: 'Forbidden' });
  });

  test('blocks request with wrong auth type', async () => {
    const app = createTestApp();

    await request(app)
      .get('/protected')
      .set('Authorization', `Basic ${validToken}`)
      .expect(403)
      .expect({ error: 'Forbidden' });
  });

  test('blocks request with wrong token', async () => {
    const app = createTestApp();

    await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer wrongtoken')
      .expect(403)
      .expect({ error: 'Forbidden' });
  });

  test('allows request with correct token', async () => {
    const app = createTestApp();

    await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect({ message: 'ok' });
  });
});
