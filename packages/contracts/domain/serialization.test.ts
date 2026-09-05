import { describe, expect, it } from 'vitest';
import {
  parseInstant,
  parseId,
  serializeDomainValue,
  deserializeDomainValue,
} from './primitives.js';
import { createTaskCommand } from './commands.js';
import type { Task } from './entities.js';
const id = <K extends string>(kind: K, value: string) => {
  const result = parseId(kind, value);
  if (!result.ok) throw new Error('fixture');
  return result.value;
};
describe('domain contract serialization', () => {
  it('accepts canonical branded IDs and UTC timestamps and rejects invalid values', () => {
    expect(parseId('task', 'task_123').ok).toBe(true);
    expect(parseInstant('2026-09-05T00:00:00.000Z').ok).toBe(true);
    expect(parseId('task', '../task').ok).toBe(false);
    expect(parseInstant('2026-09-05T08:00:00+08:00').ok).toBe(false);
  });
  it('round trips a typed command payload through JSON', () => {
    const command = createTaskCommand({
      commandId: id('command', 'command_123'),
      title: 'Contract test',
      owner: { kind: 'workspace', id: id('workspace', 'workspace_main') },
    });
    expect(command.ok).toBe(true);
    if (!command.ok) return;
    expect(deserializeDomainValue(serializeDomainValue(command.value as never))).toEqual(
      command.value,
    );
  });
  it('preserves entity values without runtime metadata', () => {
    const createdAt = parseInstant('2026-09-05T00:00:00.000Z');
    if (!createdAt.ok) throw new Error('fixture');
    const task: Task = {
      id: id('task', 'task_123'),
      workspaceId: id('workspace', 'workspace_main'),
      title: 'Read contract',
      status: 'CREATED',
      owner: { kind: 'workspace', id: id('workspace', 'workspace_main') },
      version: 1,
      createdAt: createdAt.value,
      updatedAt: createdAt.value,
    };
    expect(deserializeDomainValue(serializeDomainValue(task as never))).toEqual(task);
  });
});
