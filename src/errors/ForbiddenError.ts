import { AppError, AppErrorOptions } from './AppError';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', options: AppErrorOptions = {}) {
    super(message, {
      statusCode: 403,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
