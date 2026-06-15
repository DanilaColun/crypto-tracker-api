import { ConfigError } from '../errors/ConfigError';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LoggerOptions {
  level?: LogLevel;
}

interface LogOptions {
  requestId?: string;
}

export class Logger {
  private appName: string;
  private levels: Record<LogLevel, number>;
  private level: LogLevel;

  constructor(appName: string, options: LoggerOptions = {}) {
    if (typeof appName !== 'string' || appName.trim() === '') {
      throw new ConfigError('app name needs to be provided', {
        context: {
          field: 'appName',
          value: appName,
        },
      });
    }

    this.appName = appName;

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };

    this.level = options.level ?? 'info';

    if (!Object.prototype.hasOwnProperty.call(this.levels, this.level)) {
      throw new ConfigError('unknown log level', {
        context: {
          field: 'level',
          value: this.level,
          allowedValues: Object.keys(this.levels),
        },
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, options: LogOptions = {}): string {
    const timestamp = new Date().toISOString();
    const requestId = options.requestId ? ` [requestId=${options.requestId}]` : '';

    return `[${timestamp}] [${level.toUpperCase()}] [${this.appName}]${requestId} ${message}`;
  }

  private write(level: LogLevel, message: string, options: LogOptions = {}): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, options);

    if (level === 'error') {
      console.error(formattedMessage);
      return;
    }

    if (level === 'warn') {
      console.warn(formattedMessage);
      return;
    }

    console.log(formattedMessage);
  }

  error(message: string, options: LogOptions = {}): void {
    this.write('error', message, options);
  }

  warn(message: string, options: LogOptions = {}): void {
    this.write('warn', message, options);
  }

  info(message: string, options: LogOptions = {}): void {
    this.write('info', message, options);
  }

  debug(message: string, options: LogOptions = {}): void {
    this.write('debug', message, options);
  }

  trace(message: string, options: LogOptions = {}): void {
    this.write('trace', message, options);
  }

  log(message: string, options: LogOptions = {}): void {
    this.info(message, options);
  }
}
