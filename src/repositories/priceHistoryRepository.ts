import { Price } from './priceRepository';

export interface PriceHistoryEntry {
  symbol: string;
  price: string;
  recordedAt: string;
}

export interface PriceHistoryRepository {
  addForCurrencyTicker(ticker: string, prices: Price[], recordedAt: string): Promise<void>;
  findByCurrencyTicker(ticker: string, options?: { symbol?: string; limit?: number }): Promise<PriceHistoryEntry[]>;
}
