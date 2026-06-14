import { AppError, AppErrorOptions } from './AppError';

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options: AppErrorOptions = {}) {
    super(message, {
      statusCode: 409,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
