import { AppError, AppErrorOptions } from './AppError';

export class NotFoundError extends AppError {
  constructor(message = 'Not found', options: AppErrorOptions = {}) {
    super(message, {
      statusCode: 404,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
