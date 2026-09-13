import type {
  Action,
  ActionKind,
  ApproveActionInput,
  ApproveDecisionInput,
  CancelActionInput,
  CreateActionInput,
  CreateDecisionInput,
  Decision,
  ExecuteActionInput,
  FailActionInput,
  RejectActionInput,
  RejectDecisionInput,
} from '@uniforge/contracts';

/** Application boundary for evidence-linked decisions and actions. */
export class DecisionActionService {
  private readonly decisions = new Map<string, Decision>();
  private readonly actions = new Map<string, Action>();

  createDecision(input: CreateDecisionInput): Decision {
    this.require(input.permissions, 'knowledge:propose');
    const d = input.decision;
    if (this.decisions.has(d.id)) throw new Error('Decision already exists');
    this.requireEvidence(d.evidenceIds);
    if (!d.title.trim() || !d.rationale.trim())
      throw new Error('Decision title and rationale are required');
    const proposal: Decision = { ...d, evidenceIds: [...d.evidenceIds], status: 'PROPOSED' };
    this.decisions.set(proposal.id, proposal);
    return this.cloneDecision(proposal);
  }

  createAction(input: CreateActionInput): Action {
    this.require(input.permissions, 'knowledge:propose');
    const a = input.action;
    if (this.actions.has(a.id)) throw new Error('Action already exists');
    this.requireEvidence(a.evidenceIds);
    if (!this.decisions.has(a.decisionId)) throw new Error('Decision not found');
    if (!a.description.trim()) throw new Error('Action description is required');
    const kind = a.kind ?? 'INTERNAL';
    const proposal: Action = {
      ...a,
      kind,
      evidenceIds: [...a.evidenceIds],
      status: this.isHighRisk(kind) ? 'WAITING_APPROVAL' : 'PROPOSED',
    };
    this.actions.set(proposal.id, proposal);
    return this.cloneAction(proposal);
  }

  approveDecision(input: ApproveDecisionInput): Decision {
    this.require(input.permissions, 'knowledge:approve');
    const d = this.requireDecision(input.id);
    if (d.status !== 'PROPOSED') throw new Error('Decision is no longer pending');
    const approved = { ...d, status: 'APPROVED' as const };
    this.decisions.set(approved.id, approved);
    return this.cloneDecision(approved);
  }

  rejectDecision(input: RejectDecisionInput): Decision {
    this.require(input.permissions, 'knowledge:approve');
    const d = this.requireDecision(input.id);
    if (d.status !== 'PROPOSED') throw new Error('Decision is no longer pending');
    const rejected = {
      ...d,
      status: 'REJECTED' as const,
      ...(input.reason ? { rejectionReason: input.reason } : {}),
    };
    this.decisions.set(rejected.id, rejected);
    return this.cloneDecision(rejected);
  }

  approveAction(input: ApproveActionInput): Action {
    const a = this.requireAction(input.id);
    this.requireActionPermission(a, input.permissions);
    if (!input.approvalId.trim()) throw new Error('Approval id is required');
    if (a.status !== 'WAITING_APPROVAL' && a.status !== 'PROPOSED')
      throw new Error('Action is no longer pending');
    const approved: Action = { ...a, status: 'APPROVED', approvalId: input.approvalId };
    this.actions.set(approved.id, approved);
    return this.cloneAction(approved);
  }

  executeAction(input: ExecuteActionInput): Action;
  /** @deprecated Retained for the first decision/action slice. */
  executeAction(id: string, permissions: readonly string[], approvalId?: string): Action;
  executeAction(
    inputOrId: ExecuteActionInput | string,
    permissions?: readonly string[],
    legacyApprovalId?: string,
  ): Action {
    const input: ExecuteActionInput =
      typeof inputOrId === 'string'
        ? {
            id: inputOrId,
            permissions: permissions ?? [],
            ...(legacyApprovalId ? { approvalId: legacyApprovalId } : {}),
          }
        : inputOrId;
    const a = this.requireAction(input.id);
    this.requireActionPermission(a, input.permissions);
    if (this.requireDecision(a.decisionId).status !== 'APPROVED')
      throw new Error('Decision approval required');
    if (this.isHighRisk(a.kind ?? 'INTERNAL')) {
      if (a.status !== 'APPROVED' || !a.approvalId) throw new Error('Action approval required');
      if (input.approvalId && input.approvalId !== a.approvalId)
        throw new Error('Approval scope mismatch');
    }
    const executed: Action = { ...a, status: 'APPROVED' };
    this.actions.set(executed.id, executed);
    return this.cloneAction(executed);
  }

  rejectAction(input: RejectActionInput): Action {
    const a = this.requireAction(input.id);
    this.requireActionPermission(a, input.permissions);
    if (a.status !== 'WAITING_APPROVAL' && a.status !== 'PROPOSED')
      throw new Error('Action is no longer pending');
    const rejected: Action = {
      ...a,
      status: 'REJECTED',
      rejectionReason: input.reason ?? 'Rejected',
    };
    this.actions.set(rejected.id, rejected);
    return this.cloneAction(rejected);
  }

  cancelAction(input: CancelActionInput): Action {
    const a = this.requireAction(input.id);
    this.requireActionPermission(a, input.permissions);
    if (!input.reason.trim()) throw new Error('Cancellation reason is required');
    if (a.status === 'COMPLETED' || a.status === 'CANCELLED' || a.status === 'FAILED')
      throw new Error('Action is no longer active');
    const cancelled: Action = { ...a, status: 'CANCELLED', cancelReason: input.reason };
    this.actions.set(cancelled.id, cancelled);
    return this.cloneAction(cancelled);
  }

  failAction(input: FailActionInput): Action {
    const a = this.requireAction(input.id);
    this.requireActionPermission(a, input.permissions);
    if (!input.error.trim()) throw new Error('Failure reason is required');
    const failed: Action = { ...a, status: 'FAILED', error: input.error };
    this.actions.set(failed.id, failed);
    return this.cloneAction(failed);
  }

  getDecision(id: string, permissions: readonly string[]): Decision | null {
    this.require(permissions, 'knowledge:read');
    const d = this.decisions.get(id);
    return d ? this.cloneDecision(d) : null;
  }
  getAction(id: string, permissions: readonly string[]): Action | null {
    this.require(permissions, 'knowledge:read');
    const a = this.actions.get(id);
    return a ? this.cloneAction(a) : null;
  }
  listActions(permissions: readonly string[]): Action[] {
    this.require(permissions, 'knowledge:read');
    return [...this.actions.values()].map((a) => this.cloneAction(a));
  }

  private requireActionPermission(a: Action, permissions: readonly string[]): void {
    this.require(permissions, this.requiredPermission(a.kind ?? 'INTERNAL'));
  }
  private requiredPermission(kind: ActionKind): string {
    if (kind === 'EXTERNAL_TRANSMISSION') return 'external:send';
    if (kind === 'DESTRUCTIVE') return 'knowledge:delete';
    if (kind === 'PROJECT_CHANGE') return 'project:write';
    return 'knowledge:execute';
  }
  private isHighRisk(kind: ActionKind): boolean {
    return kind !== 'INTERNAL';
  }
  private requireEvidence(ids: readonly string[]): void {
    if (!ids.length || ids.some((id) => !id.trim())) throw new Error('Evidence required');
  }
  private requireDecision(id: string): Decision {
    const d = this.decisions.get(id);
    if (!d) throw new Error('Decision not found');
    return d;
  }
  private requireAction(id: string): Action {
    const a = this.actions.get(id);
    if (!a) throw new Error('Action not found');
    return a;
  }
  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }
  private cloneDecision(d: Decision): Decision {
    return { ...d, evidenceIds: [...d.evidenceIds] };
  }
  private cloneAction(a: Action): Action {
    return { ...a, evidenceIds: [...a.evidenceIds] };
  }
}
