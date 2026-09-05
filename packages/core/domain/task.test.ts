import { describe, expect, it } from 'vitest';
import { completeTask } from './task.js';
import type { Task } from '@uniforge/contracts/domain/entities.js';

const createdTaskFixture: Task = {
  id: 'task_123',
  workspaceId: 'workspace_main',
  title: 'Contract task',
  status: 'OPEN',
  version: 1,
  createdAt: '2026-09-05T00:00:00.000Z',
  updatedAt: '2026-09-05T00:00:00.000Z',
};

describe('completeTask', () => {
  it('completes an open task with an optimistic version check', () => {
    const result = completeTask(createdTaskFixture, 1, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({ ok: true, value: { status: 'COMPLETED', version: 2 } });
    expect(createdTaskFixture.status).toBe('OPEN');
  });
  it('rejects a cancelled task without mutation', () => {
    const task = { ...createdTaskFixture, status: 'CANCELLED' as const };
    const result = completeTask(task, task.version, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
    expect(task.status).toBe('CANCELLED');
  });
  it('rejects a stale version without mutation', () => {
    const result = completeTask(createdTaskFixture, 0, '2026-09-05T01:00:00.000Z');
    expect(result).toMatchObject({ ok: false, error: { code: 'VERSION_CONFLICT' } });
    expect(createdTaskFixture.version).toBe(1);
  });
});
