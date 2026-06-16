import { BinanceService } from '../../src/services/binanceService';
import { ExternalApiError } from '../../src/errors/ExternalApiError';

describe('BinanceService', () => {
  test('returns normalized prices', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: [
        { symbol: 'BTCUSDT', price: '68000.00000000', extra: 'ignored' },
        { symbol: 'ETHBTC', price: '0.05200000' },
      ],
    });

    const binanceService = new BinanceService({ httpClient, retryCount: 0 });

    const result = await binanceService.getAllPrices();

    expect(result).toEqual([
      { symbol: 'BTCUSDT', price: '68000.00000000' },
      { symbol: 'ETHBTC', price: '0.05200000' },
    ]);
  });

  test('retries failed request', async () => {
    const httpClient = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        statusCode: 200,
        body: [{ symbol: 'BTCUSDT', price: '68000.00000000' }],
      });

    const binanceService = new BinanceService({ httpClient, retryCount: 1, retryDelayMs: 0 });

    const result = await binanceService.getAllPrices();

    expect(httpClient).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ symbol: 'BTCUSDT', price: '68000.00000000' }]);
  });

  test('throws external api error after failed retries', async () => {
    const httpClient = jest.fn().mockRejectedValue(new Error('Network error'));

    const binanceService = new BinanceService({ httpClient, retryCount: 1, retryDelayMs: 0 });

    await expect(binanceService.getAllPrices()).rejects.toBeInstanceOf(ExternalApiError);

    expect(httpClient).toHaveBeenCalledTimes(2);
  });

  test('throws external api error for invalid response', async () => {
    const httpClient = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: { message: 'wrong data' },
    });

    const binanceService = new BinanceService({ httpClient, retryCount: 0 });

    await expect(binanceService.getAllPrices()).rejects.toBeInstanceOf(ExternalApiError);
  });
});
