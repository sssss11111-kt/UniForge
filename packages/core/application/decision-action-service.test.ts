import { describe, expect, it } from 'vitest';
import { DecisionActionService } from './decision-action-service.js';
describe('DecisionActionService', () => {
  it('requires evidence and separates proposal from execution approval', () => {
    const s = new DecisionActionService();
    s.createDecision({
      decision: {
        id: 'd',
        title: 'Adopt',
        rationale: 'evidence',
        evidenceIds: ['c'],
        status: 'EXECUTED',
      },
      permissions: ['knowledge:propose'],
    });
    const a = s.createAction({
      action: {
        id: 'a',
        decisionId: 'd',
        description: 'Do it',
        status: 'COMPLETED',
        evidenceIds: ['c'],
      },
      permissions: ['knowledge:propose'],
    });
    expect(() => s.executeAction(a.id, ['knowledge:execute'])).toThrow('approval');
    s.approveDecision({ id: 'd', permissions: ['knowledge:approve'] });
    expect(s.executeAction(a.id, ['knowledge:execute']).status).toBe('APPROVED');
  });
  it('fails closed without evidence or permission', () => {
    const s = new DecisionActionService();
    expect(() =>
      s.createDecision({
        decision: { id: 'd', title: 'x', rationale: 'x', evidenceIds: [], status: 'PROPOSED' },
        permissions: ['knowledge:propose'],
      }),
    ).toThrow('Evidence');
    expect(() =>
      s.createDecision({
        decision: { id: 'd', title: 'x', rationale: 'x', evidenceIds: ['e'], status: 'PROPOSED' },
        permissions: [],
      }),
    ).toThrow('knowledge:propose');
  });

  it('requires scoped permission and approval for external transmission', () => {
    const s = new DecisionActionService();
    s.createDecision({
      decision: {
        id: 'd',
        title: 'Notify',
        rationale: 'source',
        evidenceIds: ['e'],
        status: 'PROPOSED',
      },
      permissions: ['knowledge:propose'],
    });
    s.approveDecision({ id: 'd', permissions: ['knowledge:approve'] });
    const action = s.createAction({
      action: {
        id: 'a',
        decisionId: 'd',
        description: 'send',
        evidenceIds: ['e'],
        status: 'PROPOSED',
        kind: 'EXTERNAL_TRANSMISSION',
      },
      permissions: ['knowledge:propose'],
    });
    expect(action.status).toBe('WAITING_APPROVAL');
    expect(() => s.executeAction({ id: action.id, permissions: ['knowledge:execute'] })).toThrow(
      'external:send',
    );
    expect(() =>
      s.approveAction({ id: action.id, permissions: ['external:send'], approvalId: 'approval-1' }),
    ).not.toThrow();
    expect(
      s.executeAction({ id: action.id, permissions: ['external:send'], approvalId: 'approval-1' })
        .status,
    ).toBe('APPROVED');
  });

  it('retains rejection, cancellation, and failure records', () => {
    const s = new DecisionActionService();
    s.createDecision({
      decision: {
        id: 'd',
        title: 'Change',
        rationale: 'source',
        evidenceIds: ['e'],
        status: 'PROPOSED',
      },
      permissions: ['knowledge:propose'],
    });
    s.approveDecision({ id: 'd', permissions: ['knowledge:approve'] });
    const action = s.createAction({
      action: {
        id: 'a',
        decisionId: 'd',
        description: 'change',
        evidenceIds: ['e'],
        status: 'PROPOSED',
        kind: 'PROJECT_CHANGE',
      },
      permissions: ['knowledge:propose'],
    });
    const rejected = s.rejectAction({
      id: action.id,
      permissions: ['project:write'],
      reason: 'scope changed',
    });
    expect(rejected.status).toBe('REJECTED');
    expect(s.getAction(action.id, ['knowledge:read'])).toMatchObject({
      status: 'REJECTED',
      rejectionReason: 'scope changed',
    });
    const second = s.createAction({
      action: {
        id: 'b',
        decisionId: 'd',
        description: 'change',
        evidenceIds: ['e'],
        status: 'PROPOSED',
        kind: 'PROJECT_CHANGE',
      },
      permissions: ['knowledge:propose'],
    });
    const failed = s.failAction({
      id: second.id,
      permissions: ['project:write'],
      error: 'workspace unavailable',
    });
    expect(failed).toMatchObject({ status: 'FAILED', error: 'workspace unavailable' });
  });
});
