import { describe, expect, it } from 'vitest';
import { LangGraphAdapter, InMemoryRuntimeCheckpointStore } from '../../packages/platform-agent/langgraph/adapter.js';

describe('LangGraph security boundary', () => {
  it('stores only runtime state and never accepts a domain object as checkpoint state', async () => {
    const store = new InMemoryRuntimeCheckpointStore();
    const adapter = new LangGraphAdapter({ checkpointStore: store, graph: { invoke: async (s) => ({ ...s, phase: 'approval' }) } });
    const context = { actorId: 'actor' as never, workspaceId: 'workspace' as never, correlationId: 'security' };
    const run = await adapter.createRun(context, { taskId: 'task' as never, runtime: 'langgraph', definition: { id: 'definition' as never, version: 1, role: 'test', domain: 'test', modelPolicy: {}, contextPolicy: {}, toolPolicy: {}, permissionPolicy: {}, budgetPolicy: {}, outputSchema: {} } });
    expect(run.ok).toBe(true); if (!run.ok) return;
    await adapter.execute(context, run.value.id);
    const checkpoint = store.values()[0]; expect(checkpoint).toBeDefined(); if (!checkpoint) return;
    expect(checkpoint.state).not.toHaveProperty('workspaceId');
    expect(checkpoint.state).not.toHaveProperty('taskId');
  });
});
