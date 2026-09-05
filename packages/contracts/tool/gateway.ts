import type { Json, RequestContext, Result } from '../domain/primitives.js';

export type ToolSource = 'internal' | 'mcp' | 'local' | 'git' | 'http' | 'connector' | 'plugin' | 'project';
export type ToolRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'PROTECTED';
export type ApprovalPolicy = 'never' | 'on-risk' | 'always';
export interface JsonSchema { readonly type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'; readonly required?: readonly string[]; readonly properties?: Readonly<Record<string, JsonSchema>>; readonly items?: JsonSchema; }
export interface ToolManifest {
  id: string; version: string; source: ToolSource; capabilities: readonly string[];
  inputSchema: JsonSchema; outputSchema: JsonSchema; filesystemScope: readonly string[];
  networkScope: readonly string[]; credentialScope: readonly string[]; riskLevel: ToolRiskLevel;
  approvalPolicy: ApprovalPolicy; timeoutMs: number; resourceLimit: Readonly<Record<string, number>>;
  license: string;
}
export interface ToolInvocation { manifest: ToolManifest; input: Json; context: RequestContext; approvalToken?: string; signal?: AbortSignal; }
export interface ToolProvenance { toolId: string; toolVersion: string; source: ToolSource; correlationId: string; executedAt: string; }
export interface ToolResult { output: Json; provenance: ToolProvenance; }
export interface ToolAdapter { readonly manifest: ToolManifest; execute(input: Json, context: RequestContext, signal: AbortSignal): Promise<Result<Json>>; }
export interface ToolPermissionDecision { decision: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL'; reason: string; }
export interface ToolPermission { check(invocation: ToolInvocation): ToolPermissionDecision; verifyApproval?(invocation: ToolInvocation): boolean; }
export interface ToolGateway { register(adapter: ToolAdapter): void; invoke(id: string, input: Json, context: RequestContext, options?: { approvalToken?: string; signal?: AbortSignal }): Promise<Result<ToolResult>>; }
