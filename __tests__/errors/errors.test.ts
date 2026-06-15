import { AppError } from '../../src/errors/AppError';
import { ValidationError } from '../../src/errors/ValidationError';
import { ConfigError } from '../../src/errors/ConfigError';
import { SchedulerError } from '../../src/errors/SchedulerError';
import { ForbiddenError } from '../../src/errors/ForbiddenError';
import { NotFoundError } from '../../src/errors/NotFoundError';
import { ConflictError } from '../../src/errors/ConflictError';
import { DatabaseError } from '../../src/errors/DatabaseError';
import { ExternalApiError } from '../../src/errors/ExternalApiError';

describe('custom errors', () => {
  test('app error saves useful error info', () => {
    const error = new AppError('app crashed', {
      statusCode: 500,
      requestId: 'req-1',
      context: {
        module: 'test',
      },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.message).toBe('app crashed');
    expect(error.statusCode).toBe(500);
    expect(error.requestId).toBe('req-1');
    expect(error.context).toEqual({
      module: 'test',
    });
    expect(typeof error.timestamp).toBe('string');
  });

  test('validation error is used for bad input', () => {
    const error = new ValidationError('currency name needed', {
      context: {
        field: 'name',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('currency name needed');
    expect(error.statusCode).toBe(400);
    expect(error.context).toMatchObject({ field: 'name' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('config error is used when config is wrong', () => {
    const error = new ConfigError('app name needed', {
      context: {
        field: 'appName',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ConfigError');
    expect(error.message).toBe('app name needed');
    expect(error.statusCode).toBe(500);
    expect(error.context).toMatchObject({ field: 'appName' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('scheduler error is used when scheduler breaks', () => {
    const error = new SchedulerError('scheduler crashed', {
      context: {
        taskName: 'background task',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SchedulerError');
    expect(error.message).toBe('scheduler crashed');
    expect(error.statusCode).toBe(500);
    expect(error.context).toMatchObject({ taskName: 'background task' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('forbidden error is used for closed api', () => {
    const error = new ForbiddenError('Forbidden', {
      requestId: 'req-1',
      context: {
        path: '/api/currencies',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ForbiddenError');
    expect(error.message).toBe('Forbidden');
    expect(error.statusCode).toBe(403);
    expect(error.requestId).toBe('req-1');
    expect(error.context).toMatchObject({ path: '/api/currencies' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('not found error is used for missing data', () => {
    const error = new NotFoundError('Currency not found', {
      context: {
        ticker: 'BTC',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Currency not found');
    expect(error.statusCode).toBe(404);
    expect(error.context).toMatchObject({ ticker: 'BTC' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('conflict error is used for duplicate data', () => {
    const error = new ConflictError('Currency already exists', {
      context: {
        ticker: 'BTC',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ConflictError');
    expect(error.message).toBe('Currency already exists');
    expect(error.statusCode).toBe(409);
    expect(error.context).toMatchObject({ ticker: 'BTC' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('database error is used when database operation fails', () => {
    const error = new DatabaseError('database failed', {
      context: {
        filename: './data/app.sqlite',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DatabaseError');
    expect(error.message).toBe('database failed');
    expect(error.statusCode).toBe(500);
    expect(error.context).toMatchObject({ filename: './data/app.sqlite' });
    expect(typeof error.timestamp).toBe('string');
  });

  test('external api error is used when external service fails', () => {
    const error = new ExternalApiError('Binance request failed', {
      context: {
        service: 'Binance',
      },
    });

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ExternalApiError');
    expect(error.message).toBe('Binance request failed');
    expect(error.statusCode).toBe(502);
    expect(error.context).toMatchObject({ service: 'Binance' });
    expect(typeof error.timestamp).toBe('string');
  });
});
