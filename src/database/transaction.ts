import { AppDatabase } from './databaseConnection';

export async function runInTransaction<T>(db: AppDatabase, action: () => Promise<T>): Promise<T> {
  let transactionStarted = false;

  try {
    await db.exec('BEGIN');
    transactionStarted = true;

    const result = await action();

    await db.exec('COMMIT');

    return result;
  } catch (error) {
    if (transactionStarted) {
      await db.exec('ROLLBACK').catch(() => {});
    }

    throw error;
  }
}
