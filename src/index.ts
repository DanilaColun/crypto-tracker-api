import { Server } from 'http';
import { appConfig } from './config/appConfig';
import { databaseConfig } from './database/databaseConfig';
import { openDatabase } from './database/databaseConnection';
import { Logger } from './logger/logger';
import { SQLiteCurrencyRepository } from './repositories/sqliteCurrencyRepository';
import { SQLitePriceRepository } from './repositories/sqlitePriceRepository';
import { SQLitePriceHistoryRepository } from './repositories/sqlitePriceHistoryRepository';
import { BinanceService } from './services/binanceService';
import { PriceUpdateService } from './services/priceUpdateService';
import { startScheduler } from './scheduler/startScheduler';
import { createApp } from './http/createApp';

const logger = new Logger(appConfig.appName, {
  level: appConfig.logLevel,
});

let isShuttingDown = false;

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function start(): Promise<void> {
  const db = await openDatabase({ filename: databaseConfig.filename });

  const currencyRepository = new SQLiteCurrencyRepository({ db });
  const priceRepository = new SQLitePriceRepository({ db });
  const priceHistoryRepository = new SQLitePriceHistoryRepository({ db });

  const binanceService = new BinanceService({ logger });
  const priceUpdateService = new PriceUpdateService({
    currencyRepository,
    priceRepository,
    priceHistoryRepository,
    binanceService,
    logger,
  });

  const app = createApp({ logger, currencyRepository, priceRepository, priceHistoryRepository });

  const scheduler = startScheduler({ logger, priceUpdateService });

  const server = app.listen(appConfig.port, () => {
    logger.info(`app started on port ${appConfig.port}`);
  });

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    logger.info(`app shutdown started by ${signal}`);

    try {
      await scheduler.stop();
      logger.info('scheduler stopped');

      await closeServer(server);
      logger.info('http server closed');

      await db.close();
      logger.info('database connection closed');

      process.exit(0);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`app shutdown failed: ${message}`);
      process.exit(1);
    }
  }

  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`app failed to start: ${message}`);
  process.exit(1);
});
