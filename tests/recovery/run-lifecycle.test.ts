import { describe, expect, it } from 'vitest';
import { InMemoryAgentEventStore } from '../../packages/platform-agent/agent-event-store.js';
import type { AgentEvent, Id } from '@uniforge/contracts';
describe('run lifecycle recovery', () => {
  it('retains history when a snapshot is removed', () => {
    const store = new InMemoryAgentEventStore();
    const event: AgentEvent = {
      globalSeq: 1,
      eventId: 'event-a' as Id<'agent-event'>,
      runId: 'run-a' as Id<'agent-run'>,
      runSeq: 1,
      workspaceId: 'workspace-a' as Id<'workspace'>,
      type: 'RunCreated',
      occurredAt: '2026-09-05T00:00:00.000Z' as AgentEvent['occurredAt'],
      correlationId: 'c',
      payload: {
        taskId: 'task-a',
        definitionId: 'def-a',
        definitionVersion: 1,
        runtime: 'fixture',
      },
    };
    store.append(event);
    expect(store.events(event.runId)).toHaveLength(1);
  });
});
