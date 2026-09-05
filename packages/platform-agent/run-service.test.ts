import { describe, expect, it } from 'vitest';
import type { AgentDefinition, Id, RequestContext } from '@uniforge/contracts';
import { RunService } from './run-service.js';

const definition = {
  id: 'agent-definition-test' as Id<'agent-definition'>,
  version: 1,
  role: 'test',
  domain: 'test',
  modelPolicy: {},
  contextPolicy: {},
  toolPolicy: {},
  permissionPolicy: {},
  budgetPolicy: {},
  outputSchema: {},
} satisfies AgentDefinition;
const context = (workspaceId = 'workspace-a'): RequestContext => ({
  actorId: 'actor-a' as Id<'actor'>,
  workspaceId: workspaceId as Id<'workspace'>,
  correlationId: `c-${workspaceId}`,
});
async function makeRun() {
  const service = new RunService();
  const created = await service.createRun(context(), {
    taskId: 'task-a' as Id<'task'>,
    definition,
    runtime: 'fixture',
  });
  expect(created.ok).toBe(true);
  if (!created.ok) throw new Error('create failed');
  return { service, run: created.value };
}

describe('AgentRuntime lifecycle', () => {
  it('enforces transitions, idempotent cancellation, terminal immutability', async () => {
    const { service, run } = await makeRun();
    expect((await service.resume(context(), run.id)).ok).toBe(false);
    expect((await service.start(context(), run.id)).ok).toBe(true);
    const cancelled = await service.cancel(context(), run.id);
    expect(cancelled.ok && cancelled.value.status).toBe('CANCELLED');
    const again = await service.cancel(context(), run.id);
    expect(again.ok && again.value.version).toBe(cancelled.ok ? cancelled.value.version : -1);
    expect((await service.start(context(), run.id)).ok).toBe(false);
    expect((await service.cancel(context(), run.id)).ok).toBe(true);
  });
  it('pauses for approval and refuses automatic continuation', async () => {
    const { service, run } = await makeRun();
    await service.start(context(), run.id);
    const waiting = await service.requestApproval(context(), run.id, 'approval required for tool');
    expect(waiting.ok && waiting.value.status).toBe('WAITING_APPROVAL');
    expect((await service.resume(context(), run.id)).ok).toBe(false);
    expect((await service.resolveApproval(context(), run.id)).ok).toBe(true);
    expect((await service.resume(context(), run.id)).ok).toBe(true);
  });
  it('supports replayable, paged streams and rejects cross-workspace inspection', async () => {
    const { service, run } = await makeRun();
    await service.start(context(), run.id);
    await service.pause(context(), run.id, 'user pause');
    const events = [];
    for await (const item of service.stream(context(), run.id, 1)) events.push(item.event);
    expect(events.map((event) => event.runSeq)).toEqual([2, 3]);
    expect((await service.inspect(context('workspace-b'), run.id)).ok).toBe(false);
    const fork = await service.fork(context(), run.id);
    expect(fork.ok && fork.value.id).not.toBe(run.id);
  });
});
