import { SchedulerError } from '../../src/errors/SchedulerError';
import { scheduleTask } from '../../src/scheduler/scheduleTask';

describe('schedule task', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('runs task by interval', async () => {
    const task = jest.fn().mockResolvedValue(null);

    const schedulerTask = scheduleTask('test task', 1000, task);

    jest.advanceTimersByTime(1000);

    await Promise.resolve();
    await Promise.resolve();

    expect(task).toHaveBeenCalledTimes(1);

    await schedulerTask.stop();
  });

  test('runs task immediately if option is enabled', async () => {
    const task = jest.fn().mockResolvedValue(null);

    const schedulerTask = scheduleTask('test task', 1000, task, { runImmediately: true });

    await Promise.resolve();
    await Promise.resolve();

    expect(task).toHaveBeenCalledTimes(1);

    await schedulerTask.stop();
  });

  test('stops task interval', async () => {
    const task = jest.fn().mockResolvedValue(null);

    const schedulerTask = scheduleTask('test task', 1000, task);

    await schedulerTask.stop();

    jest.advanceTimersByTime(3000);

    await Promise.resolve();
    await Promise.resolve();

    expect(task).not.toHaveBeenCalled();
  });

  test('skips new run if previous task is still running', async () => {
    let resolveTask: () => void = () => {};

    const task = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveTask = () => resolve();
        }),
    );

    const onSkip = jest.fn();

    const schedulerTask = scheduleTask('long task', 1000, task, { onSkip });

    jest.advanceTimersByTime(1000);

    await Promise.resolve();

    jest.advanceTimersByTime(1000);

    await Promise.resolve();

    expect(task).toHaveBeenCalledTimes(1);
    expect(onSkip).toHaveBeenCalledTimes(1);

    resolveTask();

    await Promise.resolve();
    await Promise.resolve();

    await schedulerTask.stop();
  });

  test('handles null task error without crashing', async () => {
    const onError = jest.fn();

    const schedulerTask = scheduleTask(
      'broken task',
      1000,
      async () => {
        throw null;
      },
      { onError },
    );

    jest.advanceTimersByTime(1000);

    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledTimes(1);

    const error = onError.mock.calls[0][0];

    expect(error).toBeInstanceOf(SchedulerError);
    expect(error.context).toMatchObject({ taskName: 'broken task', originalErrorMessage: 'null' });

    await schedulerTask.stop();
  });

  test('handles normal error message', async () => {
    const onError = jest.fn();

    const schedulerTask = scheduleTask(
      'broken task',
      1000,
      async () => {
        throw new Error('task failed');
      },
      { onError },
    );

    jest.advanceTimersByTime(1000);

    await Promise.resolve();
    await Promise.resolve();

    const error = onError.mock.calls[0][0];

    expect(error).toBeInstanceOf(SchedulerError);
    expect(error.context).toMatchObject({ originalErrorMessage: 'task failed' });

    await schedulerTask.stop();
  });
});
