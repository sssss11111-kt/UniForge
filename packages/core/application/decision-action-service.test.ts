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
});
