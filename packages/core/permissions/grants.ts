import type { OperationRequest } from './policy.js';
export interface Grant {
  id: string;
  subjectId: string;
  workspaceId: string;
  operation: Pick<OperationRequest, 'capability' | 'resourceHandle'>;
  expiresAt: string;
  revokedAt?: string;
}
export class GrantStore {
  private readonly grants = new Map<string, Grant>();
  add(grant: Grant): void {
    this.grants.set(grant.id, grant);
  }
  revoke(id: string, at = new Date().toISOString()): void {
    const grant = this.grants.get(id);
    if (grant) this.grants.set(id, { ...grant, revokedAt: at });
  }
  get(id: string): Grant | undefined {
    return this.grants.get(id);
  }
  valid(id: string, now = Date.now()): boolean {
    const grant = this.grants.get(id);
    return !!grant && !grant.revokedAt && Date.parse(grant.expiresAt) > now;
  }
}
