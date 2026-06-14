import express from 'express';
import { createStatusRoutes } from './routes/statusRoutes';

export function createApp() {
  const app = express();

  app.use(createStatusRoutes());

  return app;
}
