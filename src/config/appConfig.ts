import type { LogLevel } from '../logger/logger';

interface AppConfig {
  appName: string;
  logLevel: LogLevel;
  port: number;
}

export const appConfig: AppConfig = {
  appName: 'Crypto Tracker API',
  logLevel: 'info',
  port: 3000,
};
