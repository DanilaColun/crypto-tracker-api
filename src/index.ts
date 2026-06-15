import { appConfig } from './config/appConfig';
import { databaseConfig } from './database/databaseConfig';
import { openDatabase } from './database/databaseConnection';
import { Logger } from './logger/logger';
import { SQLiteCurrencyRepository } from './repositories/sqliteCurrencyRepository';
import { createApp } from './http/createApp';

const logger = new Logger(appConfig.appName, {
  level: appConfig.logLevel,
});

async function start(): Promise<void> {
  const db = await openDatabase({ filename: databaseConfig.filename });
  const currencyRepository = new SQLiteCurrencyRepository({ db });

  const app = createApp({ logger, currencyRepository });

  app.listen(appConfig.port, () => {
    logger.info(`app started on port ${appConfig.port}`);
  });
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`app failed to start: ${message}`);
  process.exit(1);
});
