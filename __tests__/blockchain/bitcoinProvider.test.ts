import { BitcoinProvider } from '../../src/blockchain/bitcoinProvider';
import { ExternalApiError } from '../../src/errors/ExternalApiError';

describe('BitcoinProvider', () => {
  test('returns block height', async () => {
    const httpClient = jest.fn().mockResolvedValue({ statusCode: 200, body: 840000 });

    const provider = new BitcoinProvider({ httpClient, retryCount: 0 });

    const height = await provider.getHeight();

    expect(height).toBe(840000);
  });

  test('returns address balance in satoshi', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { chain_stats: { funded_txo_sum: 100000, spent_txo_sum: 40000 } },
    });

    const provider = new BitcoinProvider({ httpClient, retryCount: 0 });

    const result = await provider.getBalance('bc1qexample');

    expect(result).toEqual({ address: 'bc1qexample', balance: '60000', unit: 'satoshi' });
  });

  test('retries failed request', async () => {
    const httpClient = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ statusCode: 200, body: 840000 });

    const provider = new BitcoinProvider({ httpClient, retryCount: 1, retryDelayMs: 0 });

    const height = await provider.getHeight();

    expect(httpClient).toHaveBeenCalledTimes(2);
    expect(height).toBe(840000);
  });

  test('throws external api error after failed retries', async () => {
    const httpClient = jest.fn().mockRejectedValue(new Error('Network error'));

    const provider = new BitcoinProvider({ httpClient, retryCount: 1, retryDelayMs: 0 });

    await expect(provider.getHeight()).rejects.toBeInstanceOf(ExternalApiError);
    expect(httpClient).toHaveBeenCalledTimes(2);
  });

  test('throws external api error for bad status', async () => {
    const httpClient = jest.fn().mockResolvedValue({ statusCode: 500, body: 'error' });

    const provider = new BitcoinProvider({ httpClient, retryCount: 0 });

    await expect(provider.getHeight()).rejects.toBeInstanceOf(ExternalApiError);
  });
});
