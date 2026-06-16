export interface Price {
  symbol: string;
  price: string;
}

export interface PriceRepository {
  findByCurrencyTicker(ticker: string): Promise<Price[]>;
  replaceForCurrencyTicker(ticker: string, prices: Price[]): Promise<void>;
}
