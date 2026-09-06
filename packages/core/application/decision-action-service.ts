import type {
  Action,
  ApproveDecisionInput,
  CreateActionInput,
  CreateDecisionInput,
  Decision,
} from '@uniforge/contracts';
export class DecisionActionService {
  private readonly decisions = new Map<string, Decision>();
  private readonly actions = new Map<string, Action>();
  createDecision(input: CreateDecisionInput): Decision {
    this.require(input.permissions, 'knowledge:propose');
    if (!input.decision.evidenceIds.length) throw new Error('Evidence required');
    if (this.decisions.has(input.decision.id)) throw new Error('Decision already exists');
    const d = {
      ...input.decision,
      evidenceIds: [...input.decision.evidenceIds],
      status: 'PROPOSED' as const,
    };
    this.decisions.set(d.id, d);
    return { ...d, evidenceIds: [...d.evidenceIds] };
  }
  createAction(input: CreateActionInput): Action {
    this.require(input.permissions, 'knowledge:propose');
    if (!input.action.evidenceIds.length) throw new Error('Evidence required');
    if (!this.decisions.has(input.action.decisionId)) throw new Error('Decision not found');
    const a = {
      ...input.action,
      evidenceIds: [...input.action.evidenceIds],
      status: 'PROPOSED' as const,
    };
    this.actions.set(a.id, a);
    return { ...a, evidenceIds: [...a.evidenceIds] };
  }
  approveDecision(input: ApproveDecisionInput): Decision {
    this.require(input.permissions, 'knowledge:approve');
    const d = this.decisions.get(input.id);
    if (!d) throw new Error('Decision not found');
    const approved = { ...d, status: 'APPROVED' as const };
    this.decisions.set(d.id, approved);
    return { ...approved, evidenceIds: [...approved.evidenceIds] };
  }
  executeAction(id: string, permissions: readonly string[]): Action {
    this.require(permissions, 'knowledge:execute');
    const a = this.actions.get(id);
    if (!a) throw new Error('Action not found');
    const d = this.decisions.get(a.decisionId);
    if (!d || d.status !== 'APPROVED') throw new Error('Decision approval required');
    const approved = { ...a, status: 'APPROVED' as const };
    this.actions.set(id, approved);
    return { ...approved, evidenceIds: [...approved.evidenceIds] };
  }
  private require(p: readonly string[], n: string) {
    if (!p.includes(n)) throw new Error(`Missing permission: ${n}`);
  }
}
