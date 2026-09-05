import { describe, expect, it } from 'vitest';
import { evaluate } from './policy.js';
import type { OperationRequest } from './policy.js';

const request = (overrides: Partial<OperationRequest> = {}): OperationRequest => ({
  capability: 'domain.read',
  workspaceId: 'ws_one',
  resourceHandle: 'workspace:ws_one',
  payloadHash: 'hash',
  toolVersion: '1',
  riskLevel: 'LOW',
  ...overrides,
});
describe('permission policy', () => {
  it('allows low risk reads only inside the active workspace', () => {
    expect(evaluate(request(), { workspaceId: 'ws_one', actorId: 'actor_one' })).toMatchObject({
      decision: 'ALLOW',
    });
    expect(evaluate(request(), { workspaceId: 'ws_two', actorId: 'actor_one' })).toMatchObject({
      decision: 'DENY',
    });
  });
  it('requires approval for high risk and always denies protected resources', () => {
    expect(
      evaluate(request({ riskLevel: 'HIGH', capability: 'workspace.write' }), {
        workspaceId: 'ws_one',
        actorId: 'actor_one',
      }),
    ).toMatchObject({ decision: 'REQUIRE_APPROVAL' });
    expect(
      evaluate(request({ capability: 'process.exec' }), {
        workspaceId: 'ws_one',
        actorId: 'actor_one',
      }),
    ).toMatchObject({ decision: 'DENY' });
    expect(
      evaluate(request({ resourceHandle: 'uniforge-source:root', riskLevel: 'HIGH' }), {
        workspaceId: 'ws_one',
        actorId: 'actor_one',
      }),
    ).toMatchObject({ decision: 'DENY' });
  });
});
