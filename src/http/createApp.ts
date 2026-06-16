import express from 'express';
import { Logger } from '../logger/logger';
import { authConfig } from '../config/authConfig';
import { CurrencyRepository } from '../repositories/currencyRepository';
import { PriceRepository } from '../repositories/priceRepository';
import { PriceHistoryRepository } from '../repositories/priceHistoryRepository';
import { PriceService } from '../services/priceService';
import { PriceHistoryService } from '../services/priceHistoryService';
import { createRequestIdMiddleware } from './middlewares/requestIdMiddleware';
import { createRequestLoggerMiddleware } from './middlewares/requestLoggerMiddleware';
import { createErrorMiddleware } from './middlewares/errorMiddleware';
import { createAuthMiddleware } from './middlewares/authMiddleware';
import { createStatusRoutes } from './routes/statusRoutes';
import { createCurrencyRoutes } from './routes/currencyRoutes';
import { createPriceRoutes } from './routes/priceRoutes';

interface CreateAppOptions {
  logger: Logger;
  currencyRepository: CurrencyRepository;
  priceRepository: PriceRepository;
  priceHistoryRepository: PriceHistoryRepository;
  apiToken?: string;
}

export function createApp(options: CreateAppOptions) {
  const app = express();

  const apiToken = options.apiToken ?? authConfig.apiToken;
  const authMiddleware = createAuthMiddleware({ apiToken });

  const priceService = new PriceService({
    currencyRepository: options.currencyRepository,
    priceRepository: options.priceRepository,
  });

  const priceHistoryService = new PriceHistoryService({
    currencyRepository: options.currencyRepository,
    priceHistoryRepository: options.priceHistoryRepository,
  });

  app.use(createRequestIdMiddleware());
  app.use(createRequestLoggerMiddleware({ logger: options.logger }));
  app.use(express.json());

  app.use(createStatusRoutes());

  app.use('/api', authMiddleware);
  app.use('/api/currencies', createCurrencyRoutes({ currencyRepository: options.currencyRepository }));

  app.use('/price', authMiddleware);
  app.use('/price', createPriceRoutes({ priceService, priceHistoryService }));

  app.use(createErrorMiddleware({ logger: options.logger }));

  return app;
}
