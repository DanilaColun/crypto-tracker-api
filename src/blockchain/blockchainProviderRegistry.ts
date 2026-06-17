import { BlockchainProvider } from './blockchainProvider';

export class BlockchainProviderRegistry {
  private providers: Map<string, BlockchainProvider>;

  constructor(providers: BlockchainProvider[]) {
    this.providers = new Map();

    for (const provider of providers) {
      this.providers.set(provider.chain.trim().toUpperCase(), provider);
    }
  }

  get(chain: string): BlockchainProvider | undefined {
    return this.providers.get(chain.trim().toUpperCase());
  }

  supportedChains(): string[] {
    return Array.from(this.providers.keys());
  }
}
