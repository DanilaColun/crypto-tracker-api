import { RequestHandler } from 'express';
import { Logger } from '../../logger/logger';

interface RequestLoggerOptions {
  logger?: Logger;
}

export function createRequestLoggerMiddleware(options: RequestLoggerOptions = {}): RequestHandler {
  const { logger } = options;

  return (req, res, next) => {
    const requestId = req.requestId;
    const startedAt = Date.now();

    if (logger) {
      logger.info(`request started ${req.method} ${req.originalUrl}`, { requestId });
    }

    res.on('finish', () => {
      if (!logger) {
        return;
      }

      const durationMs = Date.now() - startedAt;
      const message = `request finished ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;

      if (res.statusCode >= 500) {
        logger.error(message, { requestId });
        return;
      }

      if (res.statusCode >= 400) {
        logger.warn(message, { requestId });
        return;
      }

      logger.info(message, { requestId });
    });

    next();
  };
}
