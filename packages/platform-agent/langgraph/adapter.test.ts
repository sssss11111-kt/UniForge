import { describe, expect, it } from 'vitest';
import { LangGraphAdapter, InMemoryRuntimeCheckpointStore } from './adapter.js';

const context = {
  actorId: 'actor' as never,
  workspaceId: 'workspace' as never,
  correlationId: 'lg-test',
};
const input = {
  taskId: 'task' as never,
  runtime: 'langgraph',
  definition: {
    id: 'definition' as never,
    version: 1,
    role: 'test',
    domain: 'test',
    modelPolicy: {},
    contextPolicy: {},
    toolPolicy: {},
    permissionPolicy: {},
    budgetPolicy: {},
    outputSchema: {},
  },
};

describe('LangGraph adapter boundary', () => {
  it('does not run a write step before approval', async () => {
    const writes: string[] = [];
    const adapter = new LangGraphAdapter({
      checkpointStore: new InMemoryRuntimeCheckpointStore(),
      graph: {
        invoke: async (s, o) =>
          o.interruptBeforeWrite
            ? { ...s, phase: 'approval', readResult: 'read' }
            : (writes.push('artifact'), { ...s, phase: 'completed' }),
      },
    });
    const run = await adapter.createRun(context, input);
    expect(run.ok).toBe(true);
    if (!run.ok) return;
    const paused = await adapter.execute(context, run.value.id);
    expect(paused.ok).toBe(true);
    expect(writes).toEqual([]);
    const inspected = await adapter.inspect(context, run.value.id);
    expect(inspected.ok && inspected.value.status).toBe('WAITING_APPROVAL');
  });

  it('cancels execution and preserves the runtime checkpoint as runtime-only data', async () => {
    const store = new InMemoryRuntimeCheckpointStore();
    const adapter = new LangGraphAdapter({
      checkpointStore: store,
      graph: { invoke: async (s) => s },
    });
    const run = await adapter.createRun(context, input);
    expect(run.ok).toBe(true);
    if (!run.ok) return;
    const controller = new AbortController();
    controller.abort();
    const result = await adapter.execute(context, run.value.id, { signal: controller.signal });
    expect(result).toMatchObject({ ok: false, error: { code: 'CANCELLED' } });
    expect(store.values()).toHaveLength(0);
  });
});
