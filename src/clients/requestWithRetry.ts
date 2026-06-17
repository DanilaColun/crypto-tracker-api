import { ExternalApiError } from '../errors/ExternalApiError';
import { Logger } from '../logger/logger';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface RequestWithRetryOptions {
  retryCount: number;
  retryDelayMs: number;
  failureMessage: string;
  source: string;
  requestId?: string;
  logger?: Logger;
}

export async function requestWithRetry<T>(
  attempt: () => Promise<T>,
  options: RequestWithRetryOptions,
): Promise<T> {
  let lastError: unknown = null;

  for (let attemptNumber = 1; attemptNumber <= options.retryCount + 1; attemptNumber += 1) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;

      if (options.logger) {
        const message = error instanceof Error ? error.message : String(error);
        options.logger.warn(`${options.source} request failed: ${message}`, {
          requestId: options.requestId,
        });
      }

      if (attemptNumber <= options.retryCount) {
        await wait(options.retryDelayMs);
      }
    }
  }

  if (lastError instanceof ExternalApiError) {
    throw lastError;
  }

  const reason = lastError instanceof Error ? lastError.message : 'Unknown error';

  throw new ExternalApiError(options.failureMessage, {
    requestId: options.requestId,
    context: { reason },
  });
}
