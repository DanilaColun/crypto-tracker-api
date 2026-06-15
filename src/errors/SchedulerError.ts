import { AppError, AppErrorOptions } from './AppError';

export class SchedulerError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      statusCode: 500,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
