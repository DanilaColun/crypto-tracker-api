export interface AppErrorOptions {
  statusCode?: number;
  requestId?: string | null;
  context?: Record<string, unknown> | null;
}

export class AppError extends Error {
  statusCode: number;
  timestamp: string;
  requestId: string | null;
  context: Record<string, unknown> | null;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.timestamp = new Date().toISOString();
    this.requestId = options.requestId ?? null;
    this.context = options.context ?? null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
