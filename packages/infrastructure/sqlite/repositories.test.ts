import { describe, expect, it } from 'vitest';
import { openDatabase } from './database.js';
import { migrate } from './migration-runner.js';
import { WorkspaceRepositorySqlite } from './repositories/workspace-repository.js';
import { TaskRepositorySqlite } from './repositories/task-repository.js';

const now =
  '2026-01-01T00:00:00.000Z' as unknown as import('@uniforge/contracts/domain/primitives.js').Instant;
describe('sqlite repositories', () => {
  it('round trips workspace and task and enforces foreign keys/unique handles', async () => {
    const db = await openDatabase(':memory:', 'readwrite');
    await migrate(db);
    const workspaces = new WorkspaceRepositorySqlite(db);
    const tasks = new TaskRepositorySqlite(db);
    const workspace = {
      id: 'ws_one' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      workspaceId:
        'ws_one' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      name: 'One',
      rootHandle: 'root',
      status: 'ACTIVE' as const,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await workspaces.save(workspace);
    await expect(
      workspaces.save({
        ...workspace,
        id: 'ws_two' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      }),
    ).rejects.toThrow();
    const task = {
      id: 'task_one' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'task'>,
      workspaceId:
        'ws_one' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      title: 'Task',
      status: 'CREATED' as const,
      owner: {
        kind: 'workspace' as const,
        id: 'ws_one' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      },
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await tasks.save(task);
    expect(await workspaces.get('ws_one')).toMatchObject({ name: 'One', rootHandle: 'root' });
    expect(await tasks.get('task_one')).toMatchObject({
      title: 'Task',
      owner: { kind: 'workspace', id: 'ws_one' },
    });
    await expect(
      tasks.save({
        ...task,
        id: 'orphan' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'task'>,
        workspaceId:
          'missing' as unknown as import('@uniforge/contracts/domain/primitives.js').Id<'workspace'>,
      }),
    ).rejects.toThrow();
    db.close();
  });
});
