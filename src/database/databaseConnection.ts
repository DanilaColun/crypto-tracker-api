import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export type AppDatabase = Database<sqlite3.Database, sqlite3.Statement>;

interface OpenDatabaseOptions {
  filename: string;
}

export function openDatabase(options: OpenDatabaseOptions): Promise<AppDatabase> {
  return open({
    filename: options.filename,
    driver: sqlite3.Database,
  });
}
