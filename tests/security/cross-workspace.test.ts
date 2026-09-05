import { describe, expect, it } from 'vitest';
import { evaluate } from '../../packages/core/permissions/policy.js';
describe('cross workspace security', () => {
  it('denies a request outside its context workspace', () => {
    expect(
      evaluate(
        {
          capability: 'workspace.read',
          workspaceId: 'ws_other',
          resourceHandle: 'workspace:ws_other',
          payloadHash: 'x',
          toolVersion: '1',
          riskLevel: 'LOW',
        },
        { workspaceId: 'ws_one', actorId: 'actor_one' },
      ),
    ).toMatchObject({ decision: 'DENY' });
  });
});
