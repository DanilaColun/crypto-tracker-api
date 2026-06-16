import { Logger } from '../logger/logger';
import { PriceUpdateService } from '../services/priceUpdateService';
import { scheduleTask } from './scheduleTask';

const DEFAULT_PRICE_UPDATE_INTERVAL_MS = 60000;

interface StartSchedulerOptions {
  logger: Logger;
  priceUpdateService: PriceUpdateService;
  intervalMs?: number;
}

export function startScheduler(options: StartSchedulerOptions) {
  const { logger, priceUpdateService } = options;
  const intervalMs =
    options.intervalMs ?? Number(process.env.PRICE_UPDATE_INTERVAL_MS ?? DEFAULT_PRICE_UPDATE_INTERVAL_MS);

  const requestId = 'scheduler-task';

  logger.info('scheduler started', { requestId });

  return scheduleTask(
    'price update',
    intervalMs,
    async () => {
      logger.info('price update started', { requestId });

      await priceUpdateService.updateAllPrices({ requestId });
    },
    {
      runImmediately: true,

      onSkip: () => {
        logger.warn('price update skipped: previous task still running', { requestId });
      },

      onError: (error) => {
        logger.error(`${error.name}: ${error.message}`, { requestId });
      },
    },
  );
}
