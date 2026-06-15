import { ValidationError } from '../errors/ValidationError';
import { Currency } from '../repositories/currencyRepository';

interface ValidateOptions {
  requestId?: string;
}

export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

export function validateCurrencyPayload(payload: unknown, options: ValidateOptions = {}): Currency {
  const data = (payload ?? {}) as Record<string, unknown>;

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const ticker = typeof data.ticker === 'string' ? normalizeTicker(data.ticker) : '';

  const details: string[] = [];

  if (!name) {
    details.push('Name is required');
  }

  if (!ticker) {
    details.push('Ticker is required');
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid currency data', {
      requestId: options.requestId,
      context: {
        details,
      },
    });
  }

  return { name, ticker };
}
