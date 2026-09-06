export type DecisionStatus = 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
export type ActionStatus = 'PROPOSED' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
export interface Decision {
  id: string;
  title: string;
  rationale: string;
  evidenceIds: readonly string[];
  status: DecisionStatus;
}
export interface Action {
  id: string;
  decisionId: string;
  description: string;
  status: ActionStatus;
  evidenceIds: readonly string[];
}
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
}
