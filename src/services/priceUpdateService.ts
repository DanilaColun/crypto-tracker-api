import { Logger } from '../logger/logger';
import { CurrencyRepository } from '../repositories/currencyRepository';
import { Price, PriceRepository } from '../repositories/priceRepository';
import { BinanceService } from './binanceService';

interface PriceUpdateServiceOptions {
  currencyRepository: CurrencyRepository;
  priceRepository: PriceRepository;
  binanceService: BinanceService;
  logger?: Logger;
}

interface UpdateResult {
  updatedCurrencies: number;
  updatedPrices: number;
  durationMs: number;
}

export class PriceUpdateService {
  private currencyRepository: CurrencyRepository;
  private priceRepository: PriceRepository;
  private binanceService: BinanceService;
  private logger?: Logger;

  constructor(options: PriceUpdateServiceOptions) {
    this.currencyRepository = options.currencyRepository;
    this.priceRepository = options.priceRepository;
    this.binanceService = options.binanceService;
    this.logger = options.logger;
  }

  async updateAllPrices(options: { requestId?: string } = {}): Promise<UpdateResult> {
    const requestId = options.requestId ?? 'price-update-task';
    const startedAt = Date.now();

    const currencies = await this.currencyRepository.findAll();

    if (currencies.length === 0) {
      this.logInfo('price update skipped: no currencies', { requestId });

      return {
        updatedCurrencies: 0,
        updatedPrices: 0,
        durationMs: Date.now() - startedAt,
      };
    }

    const allPrices = await this.binanceService.getAllPrices({ requestId });

    let updatedPrices = 0;

    for (const currency of currencies) {
      const pricesForCurrency = this.filterPricesByTicker(allPrices, currency.ticker);

      await this.priceRepository.replaceForCurrencyTicker(currency.ticker, pricesForCurrency);

      updatedPrices += pricesForCurrency.length;
    }

    const result: UpdateResult = {
      updatedCurrencies: currencies.length,
      updatedPrices,
      durationMs: Date.now() - startedAt,
    };

    this.logInfo(
      `price update done: currencies=${result.updatedCurrencies}, prices=${result.updatedPrices}, durationMs=${result.durationMs}`,
      { requestId },
    );

    return result;
  }

  private filterPricesByTicker(prices: Price[], ticker: string): Price[] {
    const normalizedTicker = ticker.trim().toUpperCase();

    return prices.filter((price) => {
      return price.symbol.toUpperCase().includes(normalizedTicker);
    });
  }

  private logInfo(message: string, options: { requestId?: string } = {}): void {
    if (this.logger) {
      this.logger.info(message, options);
    }
  }
}
