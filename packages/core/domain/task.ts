import type { Task } from '@uniforge/contracts/domain/entities.js';
import { parseIsoUtc } from '@uniforge/contracts/domain/primitives.js';
import type { Result } from '../errors/result.js';
export function completeTask(
  task: Task,
  expectedVersion: number,
  completedAt: string,
): Result<Task> {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || !parseIsoUtc(completedAt).ok)
    return {
      ok: false,
      error: { code: 'INVALID_INPUT', message: 'Version or completion timestamp is invalid' },
    };
  if (task.version !== expectedVersion)
    return { ok: false, error: { code: 'VERSION_CONFLICT', message: 'Task version is stale' } };
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED')
    return {
      ok: false,
      error: {
        code: 'INVALID_TRANSITION',
        message: `Cannot complete task in ${task.status} state`,
      },
    };
  return {
    ok: true,
    value: { ...task, status: 'COMPLETED', version: task.version + 1, updatedAt: completedAt },
  };
}
