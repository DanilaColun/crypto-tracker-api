import { ValidationError } from '../errors/ValidationError';

interface ValidateOptions {
  requestId?: string;
}

interface PriceQuery {
  currency: string;
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
