import { BlockchainService } from '../../src/services/blockchainService';
import { BlockchainProviderRegistry } from '../../src/blockchain/blockchainProviderRegistry';
import { BlockchainProvider } from '../../src/blockchain/blockchainProvider';
import { ValidationError } from '../../src/errors/ValidationError';

function createBitcoinProvider(): BlockchainProvider {
  return {
    chain: 'BTC',
    getHeight: async () => 840000,
    getBalance: async () => ({ address: 'bc1qexample', balance: '60000', unit: 'satoshi' }),
  };
}

describe('BlockchainService', () => {
  test('returns height from the matching provider', async () => {
    const registry = new BlockchainProviderRegistry([createBitcoinProvider()]);
    const service = new BlockchainService({ registry });

    const result = await service.getHeight('btc');

    expect(result).toEqual({ chain: 'BTC', height: 840000 });
  });

  test('returns balance from the matching provider', async () => {
    const registry = new BlockchainProviderRegistry([createBitcoinProvider()]);
    const service = new BlockchainService({ registry });

    const result = await service.getBalance('BTC', 'bc1qexample');

    expect(result).toEqual({ chain: 'BTC', address: 'bc1qexample', balance: '60000', unit: 'satoshi' });
  });

  test('throws validation error for unsupported chain', async () => {
    const registry = new BlockchainProviderRegistry([createBitcoinProvider()]);
    const service = new BlockchainService({ registry });

    await expect(service.getHeight('DOGE')).rejects.toBeInstanceOf(ValidationError);
  });
});
