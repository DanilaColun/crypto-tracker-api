import { SchedulerError } from '../errors/SchedulerError';
import { validateTaskOptions } from '../validators/taskValidator';

interface ScheduleTaskOptions {
  onError?: (error: SchedulerError) => void;
  onSkip?: (info: { name: string; reason: string }) => void;
  runImmediately?: boolean;
}

interface ScheduledTask {
  name: string;
  intervalId: NodeJS.Timeout;
  runOnce: () => Promise<unknown>;
  stop: () => Promise<void>;
}

export function scheduleTask(
  name: string,
  interval: number,
  task: () => Promise<unknown>,
  options: ScheduleTaskOptions = {},
): ScheduledTask {
  validateTaskOptions(name, interval, task);

  const onError = options.onError;
  const onSkip = options.onSkip;
  const runImmediately = options.runImmediately === true;

  let isStopped = false;
  let runningTask: Promise<unknown> | null = null;

  async function executeTask(): Promise<unknown> {
    try {
      return await task();
    } catch (error) {
      const originalErrorMessage = error instanceof Error ? error.message : String(error);

      const schedulerError = new SchedulerError('Scheduled task failed', {
        context: {
          taskName: name,
          originalErrorMessage,
        },
      });

      if (onError) {
        onError(schedulerError);
      }

      return null;
    }
  }

  async function runOnce(): Promise<unknown> {
    if (isStopped) {
      return null;
    }

    if (runningTask) {
      if (onSkip) {
        onSkip({ name, reason: 'task is already running' });
      }

      return null;
    }

    runningTask = executeTask();

    try {
      return await runningTask;
    } finally {
      runningTask = null;
    }
  }

  const intervalId = setInterval(() => {
    runOnce();
  }, interval);

  if (runImmediately) {
    runOnce();
  }

  async function stop(): Promise<void> {
    isStopped = true;
    clearInterval(intervalId);

    if (runningTask) {
      await runningTask;
    }
  }

  return {
    name,
    intervalId,
    runOnce,
    stop,
  };
}
