import { ValidationError } from '../errors/ValidationError';
import { NewAddress } from '../repositories/addressRepository';

const SUPPORTED_CHAINS = ['BTC', 'ETH'];

interface ValidateOptions {
  requestId?: string;
}

export function validateAddressPayload(payload: unknown, options: ValidateOptions = {}): NewAddress {
  const data = (payload ?? {}) as Record<string, unknown>;

  const chain = typeof data.chain === 'string' ? data.chain.trim().toUpperCase() : '';
  const address = typeof data.address === 'string' ? data.address.trim() : '';

  const details: string[] = [];

  if (!chain) {
    details.push('Chain is required');
  } else if (!SUPPORTED_CHAINS.includes(chain)) {
    details.push('Chain must be BTC or ETH');
  }

  if (!address) {
    details.push('Address is required');
  }

  if (details.length > 0) {
    throw new ValidationError('Invalid address data', {
      requestId: options.requestId,
      context: {
        details,
      },
    });
  }

  return { chain, address };
}
