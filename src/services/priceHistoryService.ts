import { NotFoundError } from '../errors/NotFoundError';
import { CurrencyRepository } from '../repositories/currencyRepository';
import { PriceHistoryEntry, PriceHistoryRepository } from '../repositories/priceHistoryRepository';

interface PriceHistoryServiceOptions {
  currencyRepository: CurrencyRepository;
  priceHistoryRepository: PriceHistoryRepository;
}

interface HistoryResult {
  currency: string;
  history: PriceHistoryEntry[];
}

export class PriceHistoryService {
  private currencyRepository: CurrencyRepository;
  private priceHistoryRepository: PriceHistoryRepository;

  constructor(options: PriceHistoryServiceOptions) {
    this.currencyRepository = options.currencyRepository;
    this.priceHistoryRepository = options.priceHistoryRepository;
  }

  async getHistoryByCurrency(
    currency: string,
    options: { symbol?: string; limit?: number; requestId?: string } = {},
  ): Promise<HistoryResult> {
    const normalizedCurrency = currency.trim().toUpperCase();

    const currencyFromDb = await this.currencyRepository.findByTicker(normalizedCurrency);

    if (!currencyFromDb) {
      throw new NotFoundError('Currency not found', {
        requestId: options.requestId,
        context: { currency: normalizedCurrency },
      });
    }

    const history = await this.priceHistoryRepository.findByCurrencyTicker(normalizedCurrency, {
      symbol: options.symbol,
      limit: options.limit,
    });

    return {
      currency: normalizedCurrency,
      history,
    };
  }
}
