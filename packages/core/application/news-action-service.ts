import type {
  CreateNewsActionInput,
  NewsAction,
  NewsActionCommandInput,
  NewsActionType,
} from '@uniforge/contracts';

/** Proposal boundary for actions originating from a canonical NewsEvent. */
export class NewsActionService {
  private readonly actions = new Map<string, NewsAction>();

  create(input: CreateNewsActionInput): NewsAction {
    this.require(input.permissions, 'news:propose');
    const action = input.action;
    if (this.actions.has(action.id)) throw new Error('Action already exists');
    if (!action.id.trim() || !action.newsEventId.trim())
      throw new Error('Action id and newsEventId are required');
    if (!action.description.trim()) throw new Error('Action description is required');
    if (!action.evidenceIds.length || action.evidenceIds.some((id) => !id.trim()))
      throw new Error('Evidence required');
    if ((action.type === 'EXTERNAL_SEND' || action.type === 'SHARE') && !action.destination?.trim())
      throw new Error('Destination required');
    const provenance = action.provenance ?? {
      sourceEventIds: [action.newsEventId],
      evidenceIds: [...action.evidenceIds],
      recordedAt: new Date().toISOString(),
    };
    if (!provenance.sourceEventIds.length || provenance.sourceEventIds.some((id) => !id.trim()))
      throw new Error('Provenance source required');
    if (!provenance.evidenceIds.length || provenance.evidenceIds.some((id) => !id.trim()))
      throw new Error('Provenance evidence required');
    if (provenance.evidenceIds.some((id) => !action.evidenceIds.includes(id)))
      throw new Error('Provenance evidence must reference action evidence');
    const proposal: NewsAction = {
      ...action,
      evidenceIds: [...action.evidenceIds],
      provenance: {
        ...provenance,
        sourceEventIds: [...provenance.sourceEventIds],
        evidenceIds: [...provenance.evidenceIds],
      },
      status: 'WAITING_APPROVAL',
    };
    this.actions.set(proposal.id, proposal);
    return this.clone(proposal);
  }

  approve(input: NewsActionCommandInput): NewsAction {
    const action = this.requireAction(input.id);
    this.require(input.permissions, this.permissionFor(action.type));
    if (!input.approvalId?.trim()) throw new Error('Approval id is required');
    if (action.status !== 'WAITING_APPROVAL' && action.status !== 'PROPOSED')
      throw new Error('Action is no longer pending');
    const approved = { ...action, status: 'APPROVED' as const, approvalId: input.approvalId };
    this.actions.set(approved.id, approved);
    return this.clone(approved);
  }

  execute(input: NewsActionCommandInput): NewsAction {
    const action = this.requireAction(input.id);
    this.require(input.permissions, this.permissionFor(action.type));
    if (action.status !== 'APPROVED' || !action.approvalId)
      throw new Error('Action approval required');
    if (input.approvalId !== action.approvalId) throw new Error('Approval scope mismatch');
    const completed = {
      ...action,
      status:
        action.type === 'EXTERNAL_SEND' || action.type === 'SHARE'
          ? ('SENT' as const)
          : ('COMPLETED' as const),
    };
    this.actions.set(completed.id, completed);
    return this.clone(completed);
  }

  /** Compatibility entry point for the original external-send slice. Typed actions use approve + execute. */
  send(id: string, permissions: readonly string[]): NewsAction {
    this.require(permissions, 'external:send');
    const action = this.requireAction(id);
    if (action.type)
      return this.execute({
        id,
        permissions,
        ...(action.approvalId ? { approvalId: action.approvalId } : {}),
      });
    if (action.status !== 'WAITING_APPROVAL') throw new Error('Action approval required');
    const sent = { ...action, status: 'SENT' as const };
    this.actions.set(id, sent);
    return this.clone(sent);
  }

  reject(input: NewsActionCommandInput): NewsAction {
    const action = this.requireAction(input.id);
    this.requireActionControl(input.permissions, action.type);
    if (action.status !== 'WAITING_APPROVAL' && action.status !== 'PROPOSED')
      throw new Error('Action is no longer pending');
    const rejected = {
      ...action,
      status: 'REJECTED' as const,
      rejectionReason: input.reason?.trim() || 'Rejected',
    };
    this.actions.set(rejected.id, rejected);
    return this.clone(rejected);
  }

  cancel(id: string, permissions: readonly string[], reason: string): NewsAction {
    const action = this.requireAction(id);
    this.requireActionControl(permissions, action.type);
    if (!reason.trim()) throw new Error('Cancellation reason is required');
    if (['COMPLETED', 'SENT', 'CANCELLED', 'FAILED', 'REJECTED'].includes(action.status))
      throw new Error('Action is no longer active');
    const cancelled = { ...action, status: 'CANCELLED' as const, cancellationReason: reason };
    this.actions.set(cancelled.id, cancelled);
    return this.clone(cancelled);
  }

  fail(id: string, error: string, permissions: readonly string[]): NewsAction {
    const action = this.requireAction(id);
    this.requireActionControl(permissions, action.type);
    if (!error.trim()) throw new Error('Failure reason is required');
    if (['COMPLETED', 'SENT', 'CANCELLED', 'REJECTED'].includes(action.status))
      throw new Error('Action is no longer active');
    const failed = { ...action, status: 'FAILED' as const, error };
    this.actions.set(failed.id, failed);
    return this.clone(failed);
  }

  get(id: string, permissions: readonly string[]): NewsAction | null {
    this.require(permissions, 'news:read');
    const action = this.actions.get(id);
    return action ? this.clone(action) : null;
  }

  list(permissions: readonly string[]): NewsAction[] {
    this.require(permissions, 'news:read');
    return [...this.actions.values()].map((action) => this.clone(action));
  }

  private permissionFor(type: NewsActionType | undefined): string {
    if (type === 'EXTERNAL_SEND' || type === 'SHARE') return 'external:send';
    if (type === 'TASK' || type === 'PROJECT') return 'project:write';
    if (type === 'KNOWLEDGE' || type === 'READING_ITEM' || type === 'SAVE')
      return 'knowledge:write';
    return 'news:write';
  }
  private requireAction(id: string): NewsAction {
    const action = this.actions.get(id);
    if (!action) throw new Error('Action not found');
    return action;
  }
  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }
  private requireActionControl(
    permissions: readonly string[],
    type: NewsActionType | undefined,
  ): void {
    const required = this.permissionFor(type);
    if (!permissions.includes(required) && !permissions.includes('news:write'))
      throw new Error(`Missing permission: ${required}`);
  }
  private clone(action: NewsAction): NewsAction {
    return {
      ...action,
      evidenceIds: [...action.evidenceIds],
      ...(action.provenance
        ? {
            provenance: {
              ...action.provenance,
              sourceEventIds: [...action.provenance.sourceEventIds],
              evidenceIds: [...action.provenance.evidenceIds],
            },
          }
        : {}),
      ...(action.payload ? { payload: { ...action.payload } } : {}),
    };
  }
}
