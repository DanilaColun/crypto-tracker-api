import express from 'express';
import request from 'supertest';
import { ValidationError } from '../../../src/errors/ValidationError';
import { createErrorMiddleware } from '../../../src/http/middlewares/errorMiddleware';
import { createRequestIdMiddleware } from '../../../src/http/middlewares/requestIdMiddleware';

describe('errorMiddleware', () => {
  test('returns app error response', async () => {
    const app = express();

    app.use(createRequestIdMiddleware());

    app.get('/test', (req, res) => {
      throw new ValidationError('Invalid data', { requestId: req.requestId });
    });

    app.use(createErrorMiddleware());

    const response = await request(app).get('/test').expect(400);

    expect(response.body.error).toBe('Invalid data');
    expect(response.body.requestId).toBeDefined();
  });

  test('returns safe response for unknown error', async () => {
    const app = express();

    app.get('/test', () => {
      throw new Error('Secret error');
    });

    app.use(createErrorMiddleware());

    await request(app).get('/test').expect(500).expect({ error: 'Internal server error' });
  });
});
