import fs from 'fs/promises';
import path from 'path';
import { appConfig } from '../config/appConfig';
import { DatabaseError } from '../errors/DatabaseError';
import { Logger } from '../logger/logger';
import { databaseConfig } from './databaseConfig';
import { openDatabase, AppDatabase } from './databaseConnection';
import { schema } from './schema';

const logger = new Logger(appConfig.appName, {
  level: appConfig.logLevel,
});

interface InitDatabaseOptions {
  filename?: string;
}

export async function initDatabase(options: InitDatabaseOptions = {}): Promise<{ filename: string }> {
  const filename = options.filename ?? databaseConfig.filename;

  let db: AppDatabase | undefined;

  try {
    await fs.mkdir(path.dirname(filename), { recursive: true });

    db = await openDatabase({ filename });

    await db.exec('BEGIN');
    await db.exec(schema);
    await db.exec('COMMIT');

    logger.info(`database initialized at ${filename}`);

    return { filename };
  } catch (error) {
    if (db) {
      await db.exec('ROLLBACK').catch(() => {});
    }

    const originalMessage = error instanceof Error ? error.message : String(error);

    logger.error(`database initialization failed: ${originalMessage}`);

    throw new DatabaseError('database initialization failed', {
      context: {
        filename,
        originalMessage,
      },
    });
  } finally {
    if (db) {
      await db.close();
    }
  }
}

if (require.main === module) {
  initDatabase().catch(() => {
    process.exit(1);
  });
}
