import { ValidationError } from '../errors/ValidationError';

interface ValidateOptions {
  requestId?: string;
}

interface PriceQuery {
  currency: string;
}

interface HistoryQuery {
  currency: string;
  symbol?: string;
  limit?: number;
}

export function validatePriceQuery(query: unknown, options: ValidateOptions = {}): PriceQuery {
  const data = (query ?? {}) as Record<string, unknown>;

  const currency = typeof data.currency === 'string' ? data.currency.trim().toUpperCase() : '';

  if (!currency) {
    throw new ValidationError('Currency is required', {
      requestId: options.requestId,
      context: {
        details: ['Currency is required'],
      },
    });
  }

  return { currency };
}

export function validateHistoryQuery(query: unknown, options: ValidateOptions = {}): HistoryQuery {
  const data = (query ?? {}) as Record<string, unknown>;

  const currency = typeof data.currency === 'string' ? data.currency.trim().toUpperCase() : '';

  if (!currency) {
    throw new ValidationError('Currency is required', {
      requestId: options.requestId,
      context: {
        details: ['Currency is required'],
      },
    });
  }

  const result: HistoryQuery = { currency };

  if (typeof data.symbol === 'string' && data.symbol.trim() !== '') {
    result.symbol = data.symbol.trim().toUpperCase();
  }

  if (data.limit !== undefined) {
    const limit = Number(data.limit);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new ValidationError('Limit must be a positive integer', {
        requestId: options.requestId,
        context: {
          details: ['Limit must be a positive integer'],
        },
      });
    }

    result.limit = limit;
  }

  return result;
}
