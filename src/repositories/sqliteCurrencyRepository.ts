import { AppDatabase } from '../database/databaseConnection';
import { mapDatabaseError } from '../database/databaseErrorMapper';
import { runInTransaction } from '../database/transaction';
import { Currency, CurrencyRepository } from './currencyRepository';

interface SQLiteCurrencyRepositoryOptions {
  db: AppDatabase;
}

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

export class SQLiteCurrencyRepository implements CurrencyRepository {
  private db: AppDatabase;

  constructor(options: SQLiteCurrencyRepositoryOptions) {
    this.db = options.db;
  }

  findAll(): Promise<Currency[]> {
    return this.execute('findAll', () => {
      return this.db.all<Currency[]>('SELECT name, ticker FROM currencies ORDER BY ticker ASC');
    });
  }

  findByTicker(ticker: string): Promise<Currency | null> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'findByTicker',
      async () => {
        const currency = await this.db.get<Currency>(
          'SELECT name, ticker FROM currencies WHERE ticker = ?',
          [normalizedTicker],
        );

        return currency ?? null;
      },
      { ticker: normalizedTicker },
    );
  }

  create(currency: Currency): Promise<Currency> {
    const newCurrency: Currency = {
      name: currency.name,
      ticker: normalizeTicker(currency.ticker),
    };

    return this.execute(
      'create',
      () => {
        return runInTransaction(this.db, async () => {
          await this.db.run('INSERT INTO currencies (name, ticker) VALUES (?, ?)', [
            newCurrency.name,
            newCurrency.ticker,
          ]);

          const created = await this.db.get<Currency>(
            'SELECT name, ticker FROM currencies WHERE ticker = ?',
            [newCurrency.ticker],
          );

          return created as Currency;
        });
      },
      { ticker: newCurrency.ticker },
    );
  }

  update(ticker: string, currency: Currency): Promise<Currency | null> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'update',
      () => {
        return runInTransaction(this.db, async () => {
          const result = await this.db.run('UPDATE currencies SET name = ? WHERE ticker = ?', [
            currency.name,
            normalizedTicker,
          ]);

          if (!result.changes) {
            return null;
          }

          const updated = await this.db.get<Currency>(
            'SELECT name, ticker FROM currencies WHERE ticker = ?',
            [normalizedTicker],
          );

          return updated ?? null;
        });
      },
      { ticker: normalizedTicker },
    );
  }

  delete(ticker: string): Promise<boolean> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'delete',
      () => {
        return runInTransaction(this.db, async () => {
          const result = await this.db.run('DELETE FROM currencies WHERE ticker = ?', [
            normalizedTicker,
          ]);

          return (result.changes ?? 0) > 0;
        });
      },
      { ticker: normalizedTicker },
    );
  }

  exists(ticker: string): Promise<boolean> {
    const normalizedTicker = normalizeTicker(ticker);

    return this.execute(
      'exists',
      async () => {
        const result = await this.db.get(
          'SELECT 1 AS found FROM currencies WHERE ticker = ? LIMIT 1',
          [normalizedTicker],
        );

        return Boolean(result);
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
