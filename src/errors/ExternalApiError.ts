import { AppError, AppErrorOptions } from './AppError';

export class ExternalApiError extends AppError {
  constructor(message = 'External API error', options: AppErrorOptions = {}) {
    super(message, {
      statusCode: options.statusCode ?? 502,
      requestId: options.requestId,
      context: options.context,
    });
  }
}
