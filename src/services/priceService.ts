import { NotFoundError } from '../errors/NotFoundError';
import { CurrencyRepository } from '../repositories/currencyRepository';
import { Price, PriceRepository } from '../repositories/priceRepository';

interface PriceServiceOptions {
  currencyRepository: CurrencyRepository;
  priceRepository: PriceRepository;
}

interface PricesResult {
  currency: string;
  prices: Price[];
}

export class PriceService {
  private currencyRepository: CurrencyRepository;
  private priceRepository: PriceRepository;

  constructor(options: PriceServiceOptions) {
    this.currencyRepository = options.currencyRepository;
    this.priceRepository = options.priceRepository;
  }

  async getPricesByCurrency(currency: string, options: { requestId?: string } = {}): Promise<PricesResult> {
    const normalizedCurrency = currency.trim().toUpperCase();

    const currencyFromDb = await this.currencyRepository.findByTicker(normalizedCurrency);

    if (!currencyFromDb) {
      throw new NotFoundError('Currency not found', {
        requestId: options.requestId,
        context: { currency: normalizedCurrency },
      });
    }

    const prices = await this.priceRepository.findByCurrencyTicker(normalizedCurrency);

    return {
      currency: normalizedCurrency,
      prices,
    };
  }
}
