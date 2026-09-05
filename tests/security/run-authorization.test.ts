import { describe, expect, it } from 'vitest';
import { RunService } from '../../packages/platform-agent/run-service.js';
import type { Id, RequestContext } from '@uniforge/contracts';
describe('run authorization', () => {
  it('denies inspect and mutation from another workspace', async () => {
    const service = new RunService();
    const context = (w: string): RequestContext => ({
      actorId: 'actor-a' as Id<'actor'>,
      workspaceId: w as Id<'workspace'>,
      correlationId: 'c',
    });
    const created = await service.createRun(context('a'), {
      taskId: 'task-a' as Id<'task'>,
      runtime: 'fixture',
      definition: {
        id: 'def-a' as Id<'agent-definition'>,
        version: 1,
        role: 'r',
        domain: 'd',
        modelPolicy: {},
        contextPolicy: {},
        toolPolicy: {},
        permissionPolicy: {},
        budgetPolicy: {},
        outputSchema: {},
      },
    });
    expect(created.ok).toBe(true);
    if (created.ok) expect((await service.inspect(context('b'), created.value.id)).ok).toBe(false);
  });
});
