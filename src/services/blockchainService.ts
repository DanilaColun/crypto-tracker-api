import { ValidationError } from '../errors/ValidationError';
import { BlockchainProvider } from '../blockchain/blockchainProvider';
import { BlockchainProviderRegistry } from '../blockchain/blockchainProviderRegistry';

interface BlockchainServiceOptions {
  registry: BlockchainProviderRegistry;
}

interface HeightResult {
  chain: string;
  height: number;
}

interface AddressBalanceResult {
  chain: string;
  address: string;
  balance: string;
  unit: string;
}

export class BlockchainService {
  private registry: BlockchainProviderRegistry;

  constructor(options: BlockchainServiceOptions) {
    this.registry = options.registry;
  }

  async getHeight(chain: string, options: { requestId?: string } = {}): Promise<HeightResult> {
    const provider = this.findProvider(chain, options.requestId);

    const height = await provider.getHeight({ requestId: options.requestId });

    return { chain: provider.chain, height };
  }

  async getBalance(
    chain: string,
    address: string,
    options: { requestId?: string } = {},
  ): Promise<AddressBalanceResult> {
    const provider = this.findProvider(chain, options.requestId);

    const balance = await provider.getBalance(address, { requestId: options.requestId });

    return {
      chain: provider.chain,
      address: balance.address,
      balance: balance.balance,
      unit: balance.unit,
    };
  }

  private findProvider(chain: string, requestId?: string): BlockchainProvider {
    const provider = this.registry.get(chain);

    if (!provider) {
      throw new ValidationError('Chain is not supported', {
        requestId,
        context: {
          details: ['Chain is not supported'],
          supportedChains: this.registry.supportedChains(),
        },
      });
    }

    return provider;
  }
}
