import { failure, type Result } from '@uniforge/contracts/domain/primitives.js';
import type { TrustedUserContext } from '../identity/trusted-context.js';
import type { OperationRequest } from '../permissions/policy.js';
export interface ApprovalRecord {
  id: string;
  requestedBy: string;
  workspaceId: string;
  operation: OperationRequest;
  decision: 'PENDING' | 'APPROVED' | 'DENIED';
  requestedAt: string;
  expiresAt: string;
  consumedAt?: string;
}
export class ApprovalService {
  private readonly records = new Map<string, ApprovalRecord>();
  async request(
    operation: OperationRequest,
    context: { workspaceId: string; actorId: string },
  ): Promise<Result<ApprovalRecord>> {
    if (operation.workspaceId !== context.workspaceId)
      return failure('DENIED', 'Workspace scope mismatch');
    const id = `approval_${this.records.size + 1}`;
    const now = new Date().toISOString();
    const record = {
      id,
      requestedBy: context.actorId,
      workspaceId: context.workspaceId,
      operation,
      decision: 'PENDING' as const,
      requestedAt: now,
      expiresAt: operation.expiresAt ?? new Date(Date.now() + 300000).toISOString(),
    };
    this.records.set(id, record);
    return { ok: true, value: record };
  }
  async resolve(
    id: string,
    decision: 'APPROVED' | 'DENIED',
    context: TrustedUserContext,
  ): Promise<Result<ApprovalRecord>> {
    const record = this.records.get(id);
    if (!record || record.workspaceId !== context.workspaceId || context.source !== 'main')
      return failure('DENIED', 'Untrusted or unavailable approval context');
    if (record.decision !== 'PENDING') return failure('CONFLICT', 'Approval already resolved');
    const updated = { ...record, decision };
    this.records.set(id, updated);
    return { ok: true, value: updated };
  }
  async consume(
    id: string,
    operation: OperationRequest,
    context: { workspaceId: string; actorId: string },
  ): Promise<Result<void>> {
    const record = this.records.get(id);
    if (
      !record ||
      record.workspaceId !== context.workspaceId ||
      record.requestedBy !== context.actorId
    )
      return failure('DENIED', 'Approval scope mismatch');
    if (
      record.decision !== 'APPROVED' ||
      record.consumedAt ||
      Date.parse(record.expiresAt) <= Date.now()
    )
      return failure('EXPIRED', 'Approval is unavailable');
    if (JSON.stringify(record.operation) !== JSON.stringify(operation))
      return failure('DENIED', 'Approval payload mismatch');
    this.records.set(id, { ...record, consumedAt: new Date().toISOString() });
    return { ok: true, value: undefined };
  }
}
