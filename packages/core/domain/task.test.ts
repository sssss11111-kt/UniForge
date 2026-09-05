import { describe, expect, it } from 'vitest';
import { completeTask } from './task.js';
import { parseId, parseInstant } from '@uniforge/contracts/domain/primitives.js';
import type { Task } from '@uniforge/contracts/domain/entities.js';
const id = <K extends string>(kind: K, value: string) => {
  const result = parseId(kind, value);
  if (!result.ok) throw new Error('fixture');
  return result.value;
};
const instantResult = parseInstant('2026-09-05T00:00:00.000Z');
if (!instantResult.ok) throw new Error('fixture');
const instant = instantResult.value;
const createdTaskFixture: Task = {
  id: id('task', 'task_123'),
  workspaceId: id('workspace', 'workspace_main'),
  title: 'Contract task',
  status: 'CREATED',
  owner: { kind: 'workspace', id: id('workspace', 'workspace_main') },
  version: 1,
  createdAt: instant,
  updatedAt: instant,
};
describe('completeTask', () => {
  it('completes a created task with an optimistic version check', () => {
    const result = completeTask(createdTaskFixture, 1, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({ ok: true, value: { status: 'COMPLETED', version: 2 } });
    expect(createdTaskFixture.status).toBe('CREATED');
  });
  it('rejects a cancelled task without mutation', () => {
    const task = { ...createdTaskFixture, status: 'CANCELLED' as const };
    const result = completeTask(task, task.version, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'INVALID_TRANSITION', correlationId: 'task' },
    });
    expect(task.status).toBe('CANCELLED');
  });
  it('rejects a stale version without mutation', () => {
    const result = completeTask(createdTaskFixture, 0, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({ ok: false, error: { code: 'CONFLICT', correlationId: 'task' } });
    expect(createdTaskFixture.version).toBe(1);
  });
});
