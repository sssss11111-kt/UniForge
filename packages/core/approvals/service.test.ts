import { describe, expect, it } from 'vitest';
import { ApprovalService } from './service.js';
import { createTrustedUserContext } from '../identity/trusted-context.js';
const op = (overrides = {}) => ({
  capability: 'workspace.write',
  workspaceId: 'ws_one',
  resourceHandle: 'managed:test',
  payloadHash: 'hash',
  toolVersion: '1',
  riskLevel: 'HIGH' as const,
  ...overrides,
});
describe('approval service', () => {
  it('binds approval to exact operation and permits one consume', async () => {
    const service = new ApprovalService();
    const created = await service.request(op(), { workspaceId: 'ws_one', actorId: 'actor_one' });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(
      (
        await service.resolve(
          created.value.id,
          'APPROVED',
          createTrustedUserContext('user_one', 'ws_one'),
        )
      ).ok,
    ).toBe(true);
    expect(
      (
        await service.consume(created.value.id, op(), {
          actorId: 'actor_one',
          workspaceId: 'ws_one',
        })
      ).ok,
    ).toBe(true);
    expect(
      (
        await service.consume(created.value.id, op(), {
          actorId: 'actor_one',
          workspaceId: 'ws_one',
        })
      ).ok,
    ).toBe(false);
  });
  it('rejects changed payload, cross workspace and expired approvals', async () => {
    const service = new ApprovalService();
    const created = await service.request(op(), { workspaceId: 'ws_one', actorId: 'actor_one' });
    if (!created.ok) throw new Error('setup');
    await service.resolve(
      created.value.id,
      'APPROVED',
      createTrustedUserContext('user_one', 'ws_one'),
    );
    expect(
      await service.consume(created.value.id, op({ payloadHash: 'changed' }), {
        actorId: 'actor_one',
        workspaceId: 'ws_one',
      }),
    ).toMatchObject({ ok: false, error: { code: 'DENIED' } });
    const expired = await service.request(op({ expiresAt: '2020-01-01T00:00:00.000Z' }), {
      workspaceId: 'ws_one',
      actorId: 'actor_one',
    });
    if (!expired.ok) throw new Error('setup');
    await service.resolve(
      expired.value.id,
      'APPROVED',
      createTrustedUserContext('user_one', 'ws_one'),
    );
    expect(
      await service.consume(expired.value.id, op({ expiresAt: '2020-01-01T00:00:00.000Z' }), {
        actorId: 'actor_one',
        workspaceId: 'ws_two',
      }),
    ).toMatchObject({ ok: false, error: { code: 'DENIED' } });
  });
});
