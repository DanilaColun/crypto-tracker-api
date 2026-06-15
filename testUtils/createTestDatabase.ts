import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { initDatabase } from '../src/database/initDatabase';
import { openDatabase, AppDatabase } from '../src/database/databaseConnection';

interface TestDatabase {
  db: AppDatabase;
  filename: string;
  close: () => Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'crypto-db-'));
  const filename = path.join(tempDir, 'test.sqlite');

  await initDatabase({ filename });

  const db = await openDatabase({ filename });

  async function close(): Promise<void> {
    await db.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  return { db, filename, close };
}
