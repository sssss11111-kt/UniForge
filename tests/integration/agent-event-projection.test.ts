import { describe, expect, it } from 'vitest';
import type { AgentEvent, AgentRun, Id } from '@uniforge/contracts';
import { reduceAgentEvents } from '../../packages/platform-agent/recovery.js';

const base: AgentRun = { id: 'run-a' as Id<'agent-run'>, workspaceId: 'workspace-a' as Id<'workspace'>, taskId: 'task-a' as Id<'task'>, definitionId: 'def-a' as Id<'agent-definition'>, definitionVersion: 1, runtime: 'fixture', status: 'CREATED', version: 1, lastSeq: 0, createdAt: '2026-09-05T00:00:00.000Z' as AgentRun['createdAt'], updatedAt: '2026-09-05T00:00:00.000Z' as AgentRun['updatedAt'] };
const event = (runSeq: number, type: AgentEvent['type']): AgentEvent => ({ globalSeq: runSeq, eventId: `e-${runSeq}` as Id<'agent-event'>, runId: base.id, runSeq, workspaceId: base.workspaceId, type, occurredAt: '2026-09-05T00:00:00.000Z' as AgentEvent['occurredAt'], correlationId: 'c', payload: {} });
describe('agent event projection', () => {
  it('rebuilds snapshots from immutable history', () => { const rebuilt = reduceAgentEvents([event(1, 'RunCreated'), event(2, 'RunStarted')]); expect(rebuilt?.status).toBe('RUNNING'); expect(rebuilt?.lastSeq).toBe(2); });
  it('rejects invalid transitions', () => { expect(() => reduceAgentEvents([event(1, 'RunCreated'), event(2, 'RunCompleted')])).toThrow('AGENT_INVALID_TRANSITION'); });
});
