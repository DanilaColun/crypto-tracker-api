import { AppDatabase } from '../database/databaseConnection';
import { mapDatabaseError } from '../database/databaseErrorMapper';
import { runInTransaction } from '../database/transaction';
import { Price, PriceRepository } from './priceRepository';

interface SQLitePriceRepositoryOptions {
  db: AppDatabase;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export class SQLitePriceRepository implements PriceRepository {
  private db: AppDatabase;

  constructor(options: SQLitePriceRepositoryOptions) {
    this.db = options.db;
  }

  findByCurrencyTicker(ticker: string): Promise<Price[]> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'findByCurrencyTicker',
      () => {
        return this.db.all<Price[]>(
          'SELECT symbol, price FROM prices WHERE currency_ticker = ? ORDER BY symbol ASC',
          [normalizedTicker],
        );
      },
      { ticker: normalizedTicker },
    );
  }

  replaceForCurrencyTicker(ticker: string, prices: Price[]): Promise<void> {
    const normalizedTicker = normalizeTicker(ticker);
    const updatedAt = new Date().toISOString();

    return this.execute(
      'replaceForCurrencyTicker',
      () => {
        return runInTransaction(this.db, async () => {
          await this.db.run('DELETE FROM prices WHERE currency_ticker = ?', [normalizedTicker]);

          for (const item of prices) {
            await this.db.run(
              'INSERT INTO prices (currency_ticker, symbol, price, updated_at) VALUES (?, ?, ?, ?)',
              [normalizedTicker, normalizeSymbol(item.symbol), String(item.price), updatedAt],
            );
          }
        });
      },
      { ticker: normalizedTicker },
    );
  }

  private async execute<T>(
    operation: string,
    action: () => Promise<T>,
    context: { ticker?: string } = {},
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw mapDatabaseError(error, { operation, ...context });
    }
  }
}
