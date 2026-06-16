import { AppDatabase } from '../database/databaseConnection';
import { mapDatabaseError } from '../database/databaseErrorMapper';
import { runInTransaction } from '../database/transaction';
import { Price } from './priceRepository';
import { PriceHistoryEntry, PriceHistoryRepository } from './priceHistoryRepository';

interface SQLitePriceHistoryRepositoryOptions {
  db: AppDatabase;
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function normalizeLimit(limit?: number): number {
  if (!limit || limit < 1) {
    return DEFAULT_LIMIT;
  }

  if (limit > MAX_LIMIT) {
    return MAX_LIMIT;
  }

  return Math.floor(limit);
}

export class SQLitePriceHistoryRepository implements PriceHistoryRepository {
  private db: AppDatabase;

  constructor(options: SQLitePriceHistoryRepositoryOptions) {
    this.db = options.db;
  }

  addForCurrencyTicker(ticker: string, prices: Price[], recordedAt: string): Promise<void> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'addForCurrencyTicker',
      () => {
        return runInTransaction(this.db, async () => {
          for (const item of prices) {
            await this.db.run(
              'INSERT INTO price_history (currency_ticker, symbol, price, recorded_at) VALUES (?, ?, ?, ?)',
              [normalizedTicker, normalizeSymbol(item.symbol), String(item.price), recordedAt],
            );
          }
        });
      },
      { ticker: normalizedTicker },
    );
  }

  findByCurrencyTicker(
    ticker: string,
    options: { symbol?: string; limit?: number } = {},
  ): Promise<PriceHistoryEntry[]> {
    const normalizedTicker = normalizeTicker(ticker);
    const limit = normalizeLimit(options.limit);

    const params: (string | number)[] = [normalizedTicker];
    let sql = 'SELECT symbol, price, recorded_at AS recordedAt FROM price_history WHERE currency_ticker = ?';

    if (options.symbol) {
      sql += ' AND symbol = ?';
      params.push(normalizeSymbol(options.symbol));
    }

    sql += ' ORDER BY recorded_at DESC, id DESC LIMIT ?';
    params.push(limit);

    return this.execute(
      'findByCurrencyTicker',
      () => {
        return this.db.all<PriceHistoryEntry[]>(sql, params);
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
