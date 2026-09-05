import { describe, expect, it } from 'vitest';
import type { Id, RequestContext } from '@uniforge/contracts';
import { ToolGatewayService, createCourseExecutionTool } from './index.js';

describe('course execution tool', () => {
  it('exposes execution through Tool Gateway with approval and provenance', async () => {
    const gateway = new ToolGatewayService({
      check: () => ({ decision: 'ALLOW' as const, reason: 'approved' }),
      verifyApproval: () => true,
    });
    gateway.register(createCourseExecutionTool('course.execute', async () => ({ status: 'COMPLETED', stdout: 'ok', stderr: '' })));
    const result = await gateway.invoke('course.execute', { operation: 'RUN' }, {
      actorId: 'actor-1' as Id<'actor'>,
      workspaceId: 'workspace-1' as Id<'workspace'>,
      correlationId: 'execution-1',
    } as RequestContext, { approvalToken: 'approval-1' });
    expect(result).toMatchObject({ ok: true, value: { output: { status: 'COMPLETED' }, provenance: { toolId: 'course.execute' } } });
  });
});
