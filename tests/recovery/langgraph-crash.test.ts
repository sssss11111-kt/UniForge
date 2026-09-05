import { describe, expect, it } from 'vitest';
import {
  LangGraphAdapter,
  InMemoryRuntimeCheckpointStore,
} from '../../packages/platform-agent/langgraph/adapter.js';

describe('LangGraph checkpoint recovery', () => {
  it('retains a versioned runtime checkpoint and rejects incompatible versions', async () => {
    const store = new InMemoryRuntimeCheckpointStore();
    const adapter = new LangGraphAdapter({
      checkpointStore: store,
      graph: { invoke: async (s) => ({ ...s, phase: 'approval' }) },
    });
    const context = {
      actorId: 'actor' as never,
      workspaceId: 'workspace' as never,
      correlationId: 'recovery',
    };
    const run = await adapter.createRun(context, {
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
    });
    expect(run.ok).toBe(true);
    if (!run.ok) return;
    await adapter.execute(context, run.value.id);
    const checkpoint = store.values()[0];
    expect(checkpoint).toBeDefined();
    if (!checkpoint) return;
    expect(checkpoint).toMatchObject({
      schemaVersion: 1,
      adapterVersion: '0.1.0',
      runId: run.value.id,
      cursor: 'approval',
    });
    await store.save({ ...checkpoint, adapterVersion: '0.0.0' });
    expect(await adapter.execute(context, run.value.id)).toMatchObject({
      ok: false,
      error: { code: 'UNAVAILABLE' },
    });
  });
});
