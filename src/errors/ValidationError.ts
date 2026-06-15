import { AppError, AppErrorOptions } from './AppError';

export class ValidationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, {
      statusCode: 400,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
