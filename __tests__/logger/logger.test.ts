import { Logger } from '../../src/logger/logger';
import { ConfigError } from '../../src/errors/ConfigError';

describe('logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logger writes app started message', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const logger = new Logger('Crypto Tracker API', { level: 'info' });

    logger.info('app started');

    expect(logSpy).toHaveBeenCalledTimes(1);

    const message = logSpy.mock.calls[0][0];

    expect(message).toContain('[INFO]');
    expect(message).toContain('[Crypto Tracker API]');
    expect(message).toContain('app started');
    expect(message).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
  });

  test('logger writes request id when it is given', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const logger = new Logger('Crypto Tracker API', { level: 'info' });

    logger.info('scheduler started', { requestId: 'scheduler-task' });

    expect(logSpy).toHaveBeenCalledTimes(1);

    const message = logSpy.mock.calls[0][0];

    expect(message).toContain('[INFO]');
    expect(message).toContain('[requestId=scheduler-task]');
    expect(message).toContain('scheduler started');
  });

  test('debug message is hidden when log level is info', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const logger = new Logger('Crypto Tracker API', { level: 'info' });

    logger.debug('debug message');

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('throws config error when app name needed', () => {
    let error: unknown;

    try {
      new Logger('');
    } catch (caughtError) {
      error = caughtError;
    }

    expect(error).toBeInstanceOf(ConfigError);

    const configError = error as ConfigError;
    expect(configError.name).toBe('ConfigError');
    expect(configError.statusCode).toBe(500);
    expect(configError.context).toMatchObject({ field: 'appName' });
  });
});
