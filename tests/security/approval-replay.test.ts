import { describe, expect, it } from 'vitest';
import { ApprovalService } from '../../packages/core/approvals/service.js';
import { createTrustedUserContext } from '../../packages/core/identity/trusted-context.js';
describe('approval replay security', () => {
  it('does not allow reuse after consumption', async () => {
    const service = new ApprovalService();
    const operation = {
      capability: 'workspace.write',
      workspaceId: 'ws_one',
      resourceHandle: 'managed:test',
      payloadHash: 'a',
      toolVersion: '1',
      riskLevel: 'HIGH' as const,
    };
    const result = await service.request(operation, {
      workspaceId: 'ws_one',
      actorId: 'agent_one',
    });
    if (!result.ok) throw new Error('setup');
    await service.resolve(
      result.value.id,
      'APPROVED',
      createTrustedUserContext('user_one', 'ws_one'),
    );
    expect(
      (
        await service.consume(result.value.id, operation, {
          workspaceId: 'ws_one',
          actorId: 'agent_one',
        })
      ).ok,
    ).toBe(true);
    expect(
      (
        await service.consume(result.value.id, operation, {
          workspaceId: 'ws_one',
          actorId: 'agent_one',
        })
      ).ok,
    ).toBe(false);
  });
});
