import type { Approval } from '@uniforge/contracts/domain/permission.js';
import type { DatabaseHandle } from '../database.js';
type Row = Record<string, string | number | null>;
const text = (row: Row, key: string): string => String(row[key] ?? '');
export class ApprovalRepositorySqlite {
  constructor(private readonly handle: DatabaseHandle) {}
  async get(id: string): Promise<Approval | undefined> {
    const row = this.handle.db.prepare('SELECT * FROM approvals WHERE id = ?').get(id) as
      Row | undefined;
    return row
      ? {
          approvalId: text(row, 'id') as Approval['approvalId'],
          grantId: text(row, 'policy_version') as Approval['grantId'],
          subjectId: text(row, 'workspace_id') as Approval['subjectId'],
          scope: JSON.parse(text(row, 'scope')),
          decision: text(row, 'decision') as Approval['decision'],
          decidedAt: (text(row, 'resolved_at') ||
            text(row, 'requested_at')) as Approval['decidedAt'],
          ...(row.consumed_at
            ? { consumedAt: text(row, 'consumed_at') as Approval['decidedAt'] }
            : {}),
        }
      : undefined;
  }
  async save(
    value: Approval & {
      workspaceId?: string;
      capability?: string;
      reason?: string;
      riskLevel?: string;
      payloadHash?: string;
      toolVersion?: string;
      policyVersion?: string;
      requestedAt?: string;
      expiresAt?: string;
    },
  ): Promise<void> {
    const now = value.decidedAt;
    this.handle.db
      .prepare(
        'INSERT INTO approvals (id,workspace_id,capability,scope,reason,risk_level,payload_hash,tool_version,policy_version,requested_at,expires_at,resolved_at,decision,consumed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET decision=excluded.decision,resolved_at=excluded.resolved_at,consumed_at=excluded.consumed_at',
      )
      .run(
        value.approvalId,
        value.workspaceId ?? value.subjectId,
        value.capability ?? 'domain.write',
        JSON.stringify(value.scope),
        value.reason ?? '',
        value.riskLevel ?? 'LOW',
        value.payloadHash ?? '',
        value.toolVersion ?? '',
        value.policyVersion ?? '',
        value.requestedAt ?? now,
        value.expiresAt ?? now,
        now,
        value.decision,
        value.consumedAt ?? null,
      );
  }
}
export { ApprovalRepositorySqlite as ApprovalRepository };
