import path from 'path';
import 'dotenv/config';

interface DatabaseConfig {
  filename: string;
}

export const databaseConfig: DatabaseConfig = {
  filename: process.env.DATABASE_FILE ?? path.join(process.cwd(), 'data', 'app.sqlite'),
};
