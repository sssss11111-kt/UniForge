export type DecisionStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

/** The capability that makes an action high risk. */
export type ActionKind = 'INTERNAL' | 'EXTERNAL_TRANSMISSION' | 'DESTRUCTIVE' | 'PROJECT_CHANGE';

export type ActionStatus =
  'PROPOSED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'FAILED' | 'COMPLETED';
export interface Decision {
  id: string;
  title: string;
  rationale: string;
  evidenceIds: readonly string[];
  status: DecisionStatus;
  rejectionReason?: string;
}
export interface Action {
  id: string;
  decisionId: string;
  description: string;
  status: ActionStatus;
  evidenceIds: readonly string[];
  /** Defaults to INTERNAL for backwards-compatible proposals. */
  kind?: ActionKind;
  /** Approval receipt bound to this action when it is high risk. */
  approvalId?: string;
  error?: string;
  cancelReason?: string;
  rejectionReason?: string;
}

/** Proposal names make the proposal-before-command boundary explicit. */
export type DecisionProposal = Decision;
export type ActionProposal = Action;
export interface CreateDecisionInput {
  decision: Decision;
  permissions: readonly string[];
}
export interface CreateActionInput {
  action: Action;
  permissions: readonly string[];
}
export interface ApproveDecisionInput {
  id: string;
  permissions: readonly string[];
  approvalId?: string;
}

export interface ApproveActionInput {
  id: string;
  permissions: readonly string[];
  approvalId: string;
}

export interface ExecuteActionInput {
  id: string;
  permissions: readonly string[];
  approvalId?: string;
}

export interface RejectDecisionInput {
  id: string;
  permissions: readonly string[];
  reason?: string;
}

export interface RejectActionInput {
  id: string;
  permissions: readonly string[];
  reason?: string;
}

export interface CancelActionInput {
  id: string;
  permissions: readonly string[];
  reason: string;
}

export interface FailActionInput {
  id: string;
  permissions: readonly string[];
  error: string;
}
