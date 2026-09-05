import type { EntityId, IsoUtc } from './primitives.js';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PROTECTED';
export type PermissionCapability =
  'domain.read' | 'domain.write' | 'workspace.read' | 'workspace.write' | 'external.send';
export interface PermissionScope {
  workspaceIds?: readonly EntityId[];
  capabilities: readonly PermissionCapability[];
}
export interface PermissionGrant {
  grantId: EntityId;
  subjectId: EntityId;
  scope: PermissionScope;
  risk: RiskLevel;
  expiresAt: IsoUtc;
}
export interface Approval {
  approvalId: EntityId;
  grantId: EntityId;
  subjectId: EntityId;
  scope: PermissionScope;
  decision: 'APPROVED' | 'DENIED';
  decidedAt: IsoUtc;
  consumedAt?: IsoUtc;
}
