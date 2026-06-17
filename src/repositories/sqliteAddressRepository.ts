import { AppDatabase } from '../database/databaseConnection';
import { mapDatabaseError } from '../database/databaseErrorMapper';
import { runInTransaction } from '../database/transaction';
import { Address, AddressRepository, NewAddress } from './addressRepository';

interface SQLiteAddressRepositoryOptions {
  db: AppDatabase;
}

function normalizeChain(chain: string): string {
  return chain.trim().toUpperCase();
}

function normalizeAddress(address: string): string {
  return address.trim();
}

export class SQLiteAddressRepository implements AddressRepository {
  private db: AppDatabase;

  constructor(options: SQLiteAddressRepositoryOptions) {
    this.db = options.db;
  }

  findAll(): Promise<Address[]> {
    return this.execute('findAll', () => {
      return this.db.all<Address[]>('SELECT id, chain, address FROM addresses ORDER BY id ASC');
    });
  }

  findById(id: number): Promise<Address | null> {
    return this.execute(
      'findById',
      async () => {
        const address = await this.db.get<Address>(
          'SELECT id, chain, address FROM addresses WHERE id = ?',
          [id],
        );

        return address ?? null;
      },
      { id },
    );
  }

  create(address: NewAddress): Promise<Address> {
    const newAddress: NewAddress = {
      chain: normalizeChain(address.chain),
      address: normalizeAddress(address.address),
    };

    return this.execute(
      'create',
      () => {
        return runInTransaction(this.db, async () => {
          const result = await this.db.run('INSERT INTO addresses (chain, address) VALUES (?, ?)', [
            newAddress.chain,
            newAddress.address,
          ]);

          return {
            id: Number(result.lastID),
            chain: newAddress.chain,
            address: newAddress.address,
          };
        });
      },
      {
        chain: newAddress.chain,
        address: newAddress.address,
        conflictMessage: 'Address already exists',
      },
    );
  }

  update(id: number, address: NewAddress): Promise<Address | null> {
    const newAddress: NewAddress = {
      chain: normalizeChain(address.chain),
      address: normalizeAddress(address.address),
    };

    return this.execute(
      'update',
      () => {
        return runInTransaction(this.db, async () => {
          const result = await this.db.run('UPDATE addresses SET chain = ?, address = ? WHERE id = ?', [
            newAddress.chain,
            newAddress.address,
            id,
          ]);

          if (!result.changes) {
            return null;
          }

          return {
            id,
            chain: newAddress.chain,
            address: newAddress.address,
          };
        });
      },
      { id },
    );
  }

  remove(id: number): Promise<boolean> {
    return this.execute(
      'remove',
      async () => {
        const result = await this.db.run('DELETE FROM addresses WHERE id = ?', [id]);

        return (result.changes ?? 0) > 0;
      },
      { id },
    );
  }

  exists(chain: string, address: string): Promise<boolean> {
    return this.execute(
      'exists',
      async () => {
        const result = await this.db.get(
          'SELECT 1 AS found FROM addresses WHERE chain = ? AND address = ? LIMIT 1',
          [normalizeChain(chain), normalizeAddress(address)],
        );

        return Boolean(result);
      },
      { chain, address },
    );
  }

  private async execute<T>(
    operation: string,
    action: () => Promise<T>,
    context: Record<string, unknown> = {},
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw mapDatabaseError(error, { operation, ...context });
    }
  }
}
