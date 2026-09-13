/** User-facing intent proposed from a canonical NewsEvent. */
export type NewsActionType =
  | 'SAVE'
  | 'IGNORE'
  | 'TRACK'
  | 'SHARE'
  | 'EXTERNAL_SEND'
  | 'TASK'
  | 'KNOWLEDGE'
  | 'PROJECT'
  | 'READING_ITEM';

export type NewsActionStatus =
  | 'PROPOSED'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED'
  | 'CANCELLED';

/** Provenance retained on the action proposal; it does not copy NewsEvent content. */
export interface NewsActionProvenance {
  readonly sourceEventIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly recordedAt: string;
}

export interface NewsAction {
  id: string;
  newsEventId: string;
  type?: NewsActionType;
  description: string;
  destination?: string;
  payload?: Readonly<Record<string, unknown>>;
  evidenceIds: readonly string[];
  provenance?: NewsActionProvenance;
  status: NewsActionStatus;
  approvalId?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  error?: string;
}
export interface CreateNewsActionInput {
  action: NewsAction;
  permissions: readonly string[];
}

export interface NewsActionCommandInput {
  readonly id: string;
  readonly permissions: readonly string[];
  readonly approvalId?: string;
  readonly reason?: string;
}
