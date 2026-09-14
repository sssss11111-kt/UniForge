import { describe, expect, it } from 'vitest';
import type { AgentDefinition, Id, RequestContext } from '@uniforge/contracts';
import { AgentCenterService } from './agent-center-service.js';

const definition: AgentDefinition = {
  id: 'definition-basic' as Id<'agent-definition'>,
  version: 1,
  role: 'assistant',
  domain: 'course',
  modelPolicy: { gateway: 'model' },
  contextPolicy: {},
  toolPolicy: { gateway: 'tool' },
  permissionPolicy: { required: ['agent:run:create'] },
  budgetPolicy: {},
  outputSchema: {},
};
const context = (
  permissions: string[] = [
    'agent:run:create',
    'agent:run:control',
    'agent:approval:request',
    'agent:approval:resolve',
  ],
): RequestContext => ({
  actorId: 'actor-a' as Id<'actor'>,
  workspaceId: 'workspace-a' as Id<'workspace'>,
  correlationId: `correlation-${Math.random()}`,
  permissions,
});

describe('AgentCenterService', () => {
  it('creates a queue snapshot from the event store and exposes replayable events', async () => {
    const service = new AgentCenterService();
    const created = await service.createRun(context(), {
      taskId: 'task-a' as Id<'task'>,
      definition,
      runtime: 'native',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const snapshot = await service.getSnapshot(context());
    expect(snapshot.runs[0]?.status).toBe('CREATED');
    expect(snapshot.events[created.value.id]?.map((event) => event.type)).toEqual(['RunCreated']);
  });

  it('keeps approval, failure, and cancellation visible in the center', async () => {
    const service = new AgentCenterService();
    const created = await service.createRun(context(), {
      taskId: 'task-a' as Id<'task'>,
      definition,
      runtime: 'native',
    });
    if (!created.ok) return;
    await service.start(context(), created.value.id);
    await service.requestApproval(context(), created.value.id, 'tool requires approval');
    let snapshot = await service.getSnapshot(context());
    expect(snapshot.runs[0]?.status).toBe('WAITING_APPROVAL');
    expect(snapshot.approvals).toHaveLength(1);

    await service.rejectApproval(context(), created.value.id, 'user denied tool access');
    snapshot = await service.getSnapshot(context());
    expect(snapshot.runs[0]?.status).toBe('FAILED');
    expect(snapshot.runs[0]?.error).toBe('user denied tool access');

    const cancelled = await service.createRun(context(), {
      taskId: 'task-b' as Id<'task'>,
      definition,
      runtime: 'native',
    });
    if (!cancelled.ok) return;
    await service.cancel(context(), cancelled.value.id, 'user cancelled');
    snapshot = await service.getSnapshot(context());
    expect(snapshot.runs.find((run) => run.id === cancelled.value.id)?.status).toBe('CANCELLED');
  });

  it('rejects mutations without the required permission', async () => {
    const service = new AgentCenterService();
    const result = await service.createRun(context([]), {
      taskId: 'task-a' as Id<'task'>,
      definition,
      runtime: 'native',
    });
    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error.code).toBe('DENIED');
  });
});
