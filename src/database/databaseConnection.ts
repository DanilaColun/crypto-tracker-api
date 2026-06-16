import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

interface OpenDatabaseOptions {
  filename: string;
}

export async function openDatabase(options: OpenDatabaseOptions): Promise<AppDatabase> {
  const db = await open({
    filename: options.filename,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');

  return db;
}
