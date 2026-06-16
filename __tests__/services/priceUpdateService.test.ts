import { PriceUpdateService } from '../../src/services/priceUpdateService';
import { CurrencyRepository } from '../../src/repositories/currencyRepository';
import { PriceRepository } from '../../src/repositories/priceRepository';
import { BinanceService } from '../../src/services/binanceService';
import { Logger } from '../../src/logger/logger';

function createLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as Logger;
}

describe('PriceUpdateService', () => {
  test('updates prices for all currencies', async () => {
    const currencyRepository = {
      findAll: jest.fn().mockResolvedValue([
        { name: 'Bitcoin', ticker: 'BTC' },
        { name: 'Ethereum', ticker: 'ETH' },
      ]),
    } as unknown as CurrencyRepository;

    const priceRepository = {
      replaceForCurrencyTicker: jest.fn().mockResolvedValue(undefined),
    } as unknown as PriceRepository;

    const binanceService = {
      getAllPrices: jest.fn().mockResolvedValue([
        { symbol: 'BTCUSDT', price: '68000.00000000' },
        { symbol: 'ETHBTC', price: '0.05200000' },
        { symbol: 'ETHUSDT', price: '3500.00000000' },
      ]),
    } as unknown as BinanceService;

    const priceUpdateService = new PriceUpdateService({
      currencyRepository,
      priceRepository,
      binanceService,
      logger: createLogger(),
    });

    const result = await priceUpdateService.updateAllPrices({ requestId: 'test-request' });

    expect(currencyRepository.findAll).toHaveBeenCalledTimes(1);
    expect(binanceService.getAllPrices).toHaveBeenCalledWith({ requestId: 'test-request' });

    expect(priceRepository.replaceForCurrencyTicker).toHaveBeenCalledWith('BTC', [
      { symbol: 'BTCUSDT', price: '68000.00000000' },
      { symbol: 'ETHBTC', price: '0.05200000' },
    ]);

    expect(priceRepository.replaceForCurrencyTicker).toHaveBeenCalledWith('ETH', [
      { symbol: 'ETHBTC', price: '0.05200000' },
      { symbol: 'ETHUSDT', price: '3500.00000000' },
    ]);

    expect(result.updatedCurrencies).toBe(2);
    expect(result.updatedPrices).toBe(4);
    expect(result.durationMs).toEqual(expect.any(Number));
  });

  test('skips binance request if there are no currencies', async () => {
    const currencyRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    } as unknown as CurrencyRepository;

    const priceRepository = {
      replaceForCurrencyTicker: jest.fn(),
    } as unknown as PriceRepository;

    const binanceService = {
      getAllPrices: jest.fn(),
    } as unknown as BinanceService;

    const priceUpdateService = new PriceUpdateService({
      currencyRepository,
      priceRepository,
      binanceService,
      logger: createLogger(),
    });

    const result = await priceUpdateService.updateAllPrices({ requestId: 'test-request' });

    expect(binanceService.getAllPrices).not.toHaveBeenCalled();
    expect(priceRepository.replaceForCurrencyTicker).not.toHaveBeenCalled();

    expect(result).toEqual({
      updatedCurrencies: 0,
      updatedPrices: 0,
      durationMs: expect.any(Number),
    });
  });

  test('throws error if binance request fails', async () => {
    const currencyRepository = {
      findAll: jest.fn().mockResolvedValue([{ name: 'Bitcoin', ticker: 'BTC' }]),
    } as unknown as CurrencyRepository;

    const priceRepository = {
      replaceForCurrencyTicker: jest.fn(),
    } as unknown as PriceRepository;

    const binanceService = {
      getAllPrices: jest.fn().mockRejectedValue(new Error('Binance failed')),
    } as unknown as BinanceService;

    const priceUpdateService = new PriceUpdateService({
      currencyRepository,
      priceRepository,
      binanceService,
      logger: createLogger(),
    });

    await expect(priceUpdateService.updateAllPrices({ requestId: 'test-request' })).rejects.toThrow(
      'Binance failed',
    );

    expect(priceRepository.replaceForCurrencyTicker).not.toHaveBeenCalled();
  });
});
