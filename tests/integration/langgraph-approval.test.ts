import { describe, expect, it } from 'vitest';
import {
  LangGraphAdapter,
  InMemoryRuntimeCheckpointStore,
} from '../../packages/platform-agent/langgraph/adapter.js';

describe('LangGraph approval integration', () => {
  it('runs the graph through approval before performing the injected write', async () => {
    const writes: string[] = [];
    const adapter = new LangGraphAdapter({
      checkpointStore: new InMemoryRuntimeCheckpointStore(),
      graph: {
        invoke: async (s, o) =>
          o.interruptBeforeWrite
            ? { ...s, phase: 'approval' }
            : (writes.push('artifact'), { ...s, phase: 'completed' }),
      },
    });
    const context = {
      actorId: 'actor' as never,
      workspaceId: 'workspace' as never,
      correlationId: 'integration',
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
    const paused = await adapter.execute(context, run.value.id);
    expect(paused.ok && paused.value.status).toBe('WAITING_APPROVAL');
    expect(writes).toEqual([]);
    const completed = await adapter.execute(context, run.value.id, { approve: true });
    expect(completed.ok && completed.value.status).toBe('COMPLETED');
    expect(writes).toEqual(['artifact']);
  });
});
