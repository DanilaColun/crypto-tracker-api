import { ValidationError } from '../errors/ValidationError';

interface ValidateOptions {
  requestId?: string;
}

interface ChainQuery {
  chain: string;
}

interface BalanceQuery {
  chain: string;
  address: string;
}

export function validateChainQuery(query: unknown, options: ValidateOptions = {}): ChainQuery {
  const data = (query ?? {}) as Record<string, unknown>;

  const chain = typeof data.chain === 'string' ? data.chain.trim().toUpperCase() : '';

  if (!chain) {
    throw new ValidationError('Chain is required', {
      requestId: options.requestId,
      context: {
        details: ['Chain is required'],
      },
    });
  }

  return { chain };
}

export function validateBalanceQuery(query: unknown, options: ValidateOptions = {}): BalanceQuery {
  const { chain } = validateChainQuery(query, options);

  const data = (query ?? {}) as Record<string, unknown>;

  const address = typeof data.address === 'string' ? data.address.trim() : '';

  if (!address) {
    throw new ValidationError('Address is required', {
      requestId: options.requestId,
      context: {
        details: ['Address is required'],
      },
    });
  }

  return { chain, address };
}
