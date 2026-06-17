import { AppError } from '../errors/AppError';
import { ConflictError } from '../errors/ConflictError';
import { DatabaseError } from '../errors/DatabaseError';

interface MapErrorContext {
  operation?: string;
  conflictMessage?: string;
  [key: string]: unknown;
}

function isSqliteConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as { code?: string }).code ?? '';

  return code.startsWith('SQLITE_CONSTRAINT') || error.message.includes('UNIQUE constraint failed');
}

export function mapDatabaseError(error: unknown, context: MapErrorContext = {}): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const { conflictMessage, ...rest } = context;

  if (isSqliteConstraintError(error) && context.operation === 'create') {
    return new ConflictError(conflictMessage ?? 'Resource already exists', {
      context: rest,
    });
  }

  const originalMessage = error instanceof Error ? error.message : String(error);

  return new DatabaseError('Database operation failed', {
    context: {
      ...rest,
      originalMessage,
    },
  });
}
