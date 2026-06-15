import express from 'express';
import { Logger } from '../logger/logger';
import { createRequestIdMiddleware } from './middlewares/requestIdMiddleware';
import { createRequestLoggerMiddleware } from './middlewares/requestLoggerMiddleware';
import { createErrorMiddleware } from './middlewares/errorMiddleware';
import { createStatusRoutes } from './routes/statusRoutes';

interface CreateAppOptions {
  logger: Logger;
}

export function createApp(options: CreateAppOptions) {
  const app = express();

  app.use(createRequestIdMiddleware());
  app.use(createRequestLoggerMiddleware({ logger: options.logger }));

  app.use(createStatusRoutes());

  app.use(createErrorMiddleware({ logger: options.logger }));

  return app;
}
