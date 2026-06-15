import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';

export function createRequestIdMiddleware(): RequestHandler {
  return (req, res, next) => {
    const headerValue = req.headers['x-request-id'];
    const requestId = typeof headerValue === 'string' ? headerValue : randomUUID();

    req.requestId = requestId;
    res.set('X-Request-Id', requestId);

    next();
  };
}
