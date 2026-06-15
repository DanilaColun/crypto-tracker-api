import { ErrorRequestHandler } from 'express';
import { AppError } from '../../errors/AppError';
import { Logger } from '../../logger/logger';

interface ErrorMiddlewareOptions {
  logger?: Logger;
}

interface ErrorResponseBody {
  error: string;
  requestId?: string;
  details?: unknown[];
}

export function createErrorMiddleware(options: ErrorMiddlewareOptions = {}): ErrorRequestHandler {
  const { logger } = options;

  return (error, req, res, next) => {
    const isAppError = error instanceof AppError;
    const statusCode = isAppError ? error.statusCode : 500;
    const message = isAppError ? error.message : 'Internal server error';
    const requestId = (isAppError ? error.requestId : null) ?? req.requestId ?? null;

    if (logger) {
      const logData = {
        requestId: requestId ?? undefined,
        context: {
          statusCode,
          method: req.method,
          path: req.originalUrl,
          errorName: error instanceof Error ? error.name : 'Error',
          errorContext: isAppError ? error.context : null,
        },
      };

      if (statusCode >= 500) {
        logger.error(message, logData);
      } else {
        logger.warn(message, logData);
      }
    }

    const responseBody: ErrorResponseBody = {
      error: message,
    };

    if (requestId) {
      responseBody.requestId = requestId;
    }

    const details = isAppError ? error.context?.details : undefined;

    if (Array.isArray(details)) {
      responseBody.details = details;
    }

    res.status(statusCode).json(responseBody);
  };
}
