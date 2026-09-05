import { describe, expect, it } from 'vitest';
import {
  parseIsoUtc,
  parseEntityId,
  serializeDomainValue,
  deserializeDomainValue,
} from './primitives.js';
import { createTaskCommand } from './commands.js';
import type { Task } from './entities.js';

describe('domain contract serialization', () => {
  it('accepts canonical IDs and UTC timestamps and rejects invalid values', () => {
    expect(parseEntityId('task_123').ok).toBe(true);
    expect(parseIsoUtc('2026-09-05T00:00:00.000Z').ok).toBe(true);
    expect(parseEntityId('../task').ok).toBe(false);
    expect(parseIsoUtc('2026-09-05T08:00:00+08:00').ok).toBe(false);
  });
  it('round trips typed command payloads through JSON', () => {
    const command = createTaskCommand({
      taskId: 'task_123',
      workspaceId: 'workspace_main',
      title: 'Contract test',
      requestedAt: '2026-09-05T00:00:00.000Z',
    });
    expect(command.ok).toBe(true);
    if (!command.ok) return;
    expect(deserializeDomainValue<unknown>(serializeDomainValue(command.value))).toEqual(
      command.value,
    );
  });

  it('rejects an unsafe task command at the contract boundary', () => {
    const command = createTaskCommand({
      taskId: '../escape',
      workspaceId: 'workspace_main',
      title: 'Rejected',
      requestedAt: '2026-09-05T00:00:00.000Z',
    });
    expect(command).toMatchObject({ ok: false, error: { code: 'INVALID_ID' } });
  });
  it('preserves entity values without runtime metadata', () => {
    const task: Task = {
      id: 'task_123',
      workspaceId: 'workspace_main',
      title: 'Read contract',
      status: 'OPEN',
      version: 1,
      createdAt: '2026-09-05T00:00:00.000Z',
      updatedAt: '2026-09-05T00:00:00.000Z',
    };
    expect(deserializeDomainValue<Task>(serializeDomainValue(task))).toEqual(task);
  });
});
