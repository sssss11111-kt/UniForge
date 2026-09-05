export type PolicyDecision =
  | { decision: 'ALLOW'; reason: string }
  | { decision: 'DENY'; reason: string }
  | { decision: 'REQUIRE_APPROVAL'; reason: string };
export interface OperationRequest {
  capability: string;
  workspaceId: string;
  resourceHandle: string;
  payloadHash: string;
  toolVersion: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'PROTECTED';
  expiresAt?: string;
}
export interface PolicyContext {
  workspaceId: string;
  actorId: string;
}
const protectedPrefixes = [
  'uniforge-source:',
  'uniforge-install:',
  'uniforge-updater:',
  'uniforge-migrations:',
  'uniforge-permissions:',
  'uniforge-build:',
];
export function evaluate(operation: OperationRequest, context: PolicyContext): PolicyDecision {
  if (!operation.workspaceId || operation.workspaceId !== context.workspaceId)
    return { decision: 'DENY', reason: 'Workspace scope mismatch' };
  if (protectedPrefixes.some((prefix) => operation.resourceHandle.startsWith(prefix)))
    return { decision: 'DENY', reason: 'Protected resource' };
  if (/^(process|shell|cli|mcp|filesystem)\./.test(operation.capability))
    return { decision: 'DENY', reason: 'Capability unavailable in Stage 0' };
  if (
    !['domain.read', 'workspace.read', 'domain.write', 'workspace.write', 'external.send'].includes(
      operation.capability,
    )
  )
    return { decision: 'DENY', reason: 'Capability is not registered' };
  if (operation.riskLevel === 'PROTECTED')
    return { decision: 'DENY', reason: 'Protected operations cannot be approved' };
  if (operation.riskLevel === 'HIGH' || operation.capability === 'external.send')
    return { decision: 'REQUIRE_APPROVAL', reason: 'High risk operation requires exact approval' };
  return { decision: 'ALLOW', reason: 'Registered operation within workspace scope' };
}
