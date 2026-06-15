import { createApp } from '../src/http/createApp';
import { Logger } from '../src/logger/logger';
import { SQLiteCurrencyRepository } from '../src/repositories/sqliteCurrencyRepository';
import { CurrencyRepository } from '../src/repositories/currencyRepository';
import { createTestDatabase } from './createTestDatabase';

interface CreateTestAppOptions {
  apiToken: string;
  currencyRepository?: CurrencyRepository;
}

export async function createTestApp(options: CreateTestAppOptions) {
  const testDatabase = await createTestDatabase();

  const currencyRepository =
    options.currencyRepository ?? new SQLiteCurrencyRepository({ db: testDatabase.db });

  const logger = new Logger('test', { level: 'error' });

  const app = createApp({
    logger,
    currencyRepository,
    apiToken: options.apiToken,
  });

  return {
    app,
    testDatabase,
    currencyRepository,
  };
}
