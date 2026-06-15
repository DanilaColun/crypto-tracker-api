export interface Currency {
  name: string;
  ticker: string;
}

export interface CurrencyRepository {
  findAll(): Promise<Currency[]>;
  findByTicker(ticker: string): Promise<Currency | null>;
  create(currency: Currency): Promise<Currency>;
  update(ticker: string, currency: Currency): Promise<Currency | null>;
  delete(ticker: string): Promise<boolean>;
  exists(ticker: string): Promise<boolean>;
}
