import { EthereumProvider } from '../../src/blockchain/ethereumProvider';
import { ExternalApiError } from '../../src/errors/ExternalApiError';

describe('EthereumProvider', () => {
  test('returns block height from hex', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { jsonrpc: '2.0', id: 1, result: '0x10' },
    });

    const provider = new EthereumProvider({ httpClient, retryCount: 0 });

    const height = await provider.getHeight();

    expect(height).toBe(16);
  });

  test('returns address balance in wei', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { jsonrpc: '2.0', id: 1, result: '0xde0b6b3a7640000' },
    });

    const provider = new EthereumProvider({ httpClient, retryCount: 0 });

    const result = await provider.getBalance('0xabc');

    expect(result).toEqual({ address: '0xabc', balance: '1000000000000000000', unit: 'wei' });
  });

  test('throws external api error on rpc error', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'bad request' } },
    });

    const provider = new EthereumProvider({ httpClient, retryCount: 0 });

    await expect(provider.getHeight()).rejects.toBeInstanceOf(ExternalApiError);
  });

  test('throws external api error after failed retries', async () => {
    const httpClient = jest.fn().mockRejectedValue(new Error('Network error'));

    const provider = new EthereumProvider({ httpClient, retryCount: 1, retryDelayMs: 0 });

    await expect(provider.getHeight()).rejects.toBeInstanceOf(ExternalApiError);
    expect(httpClient).toHaveBeenCalledTimes(2);
  });
});
