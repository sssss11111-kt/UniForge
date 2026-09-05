import type { Task } from '@uniforge/contracts/domain/entities.js';
import { parseInstant, type FailureCode } from '@uniforge/contracts/domain/primitives.js';
import type { Result } from '../errors/result.js';
function error(
  code: FailureCode,
  message: string,
): { ok: false; error: { code: FailureCode; message: string; correlationId: string } } {
  return { ok: false, error: { code, message, correlationId: 'task' } };
}
export function completeTask(
  task: Task,
  expectedVersion: number,
  completedAt: string,
): Result<Task> {
  if (
    !Number.isSafeInteger(expectedVersion) ||
    expectedVersion < 0 ||
    !parseInstant(completedAt).ok
  )
    return error('INVALID_INPUT', 'Version or completion timestamp is invalid');
  if (task.version !== expectedVersion) return error('CONFLICT', 'Task version is stale');
  if (task.status === 'COMPLETED' || task.status === 'CANCELLED')
    return error('INVALID_TRANSITION', `Cannot complete task in ${task.status} state`);
  return {
    ok: true,
    value: {
      ...task,
      status: 'COMPLETED',
      version: task.version + 1,
      updatedAt: completedAt as Task['updatedAt'],
    },
  };
}
