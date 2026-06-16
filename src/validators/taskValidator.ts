import { ValidationError } from '../errors/ValidationError';

export function validateTaskOptions(name: string, interval: number, task: unknown): void {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('task name needed', {
      context: { field: 'name', value: name },
    });
  }

  if (typeof interval !== 'number' || !Number.isFinite(interval) || interval <= 0) {
    throw new ValidationError('task interval needs to be bigger than 0', {
      context: { field: 'interval', value: interval },
    });
  }

  if (typeof task !== 'function') {
    throw new ValidationError('task callback needs to be a function', {
      context: { field: 'task', valueType: typeof task },
    });
  }
}
