import { describe, expect, it } from 'vitest';
import { InMemoryRecycleStore, RecycleBinService } from './service.js';

describe('recycle bin lifecycle', () => {
  it('retains metadata for 30 days, hides deleted entities, and restores', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const store = new InMemoryRecycleStore();
    const bin = new RecycleBinService(store, () => now);
    const item = bin.delete({
      id: 'trash-1',
      workspaceId: 'ws-1',
      entityType: 'task',
      entityId: 'task-1',
      restoreMetadata: { status: 'OPEN' },
      version: 2,
    });
    expect(item.purgeAfter).toBe('2026-01-31T00:00:00.000Z');
    expect(bin.isSearchable('task-1')).toBe(false);
    expect(bin.restore(item.id)?.entityId).toBe('task-1');
    expect(bin.isSearchable('task-1')).toBe(true);
  });

  it('purges only expired entries', () => {
    let now = new Date('2026-01-01T00:00:00.000Z');
    const store = new InMemoryRecycleStore();
    const bin = new RecycleBinService(store, () => now);
    bin.delete({
      id: 'trash-1',
      workspaceId: 'ws-1',
      entityType: 'task',
      entityId: 'task-1',
      restoreMetadata: {},
      version: 1,
    });
    now = new Date('2026-02-01T00:00:00.000Z');
    expect(bin.purgeExpired()).toBe(1);
  });
});
