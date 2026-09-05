import type { Json, RequestContext, Result } from '../domain/primitives.js';

export type ModelCapability =
  'text' | 'vision' | 'tools' | 'structuredOutput' | 'streaming' | 'embedding';
export type ModelDataClass = 'PUBLIC' | 'PRIVATE' | 'SENSITIVE';
export type ModelRouteLevel = 'run' | 'preset' | 'owner' | 'module' | 'global' | 'fallback';
export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
export interface ModelRequest {
  purpose: string;
  messages: ModelMessage[];
  requiredCapabilities: ModelCapability[];
  dataClass: ModelDataClass;
  routeOverrides: Partial<Record<ModelRouteLevel, string>>;
  maxOutputTokens: number;
  credentialRef?: string;
}
export interface ModelUsage {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
}
export interface ModelOutput {
  text: string;
  provider: string;
  model: string;
  usage: Json;
  cost: number | null;
  currency: string | null;
}
export type ModelChunk =
  | { type: 'delta'; text: string }
  | { type: 'done'; output: ModelOutput }
  | { type: 'error'; error: Json };
export interface ModelRoute {
  id: string;
  provider: string;
  model: string;
  capabilities: ModelCapability[];
  endpoint?: string;
  credentialRef?: string;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}
export interface ModelGateway {
  generate(
    request: ModelRequest,
    context: RequestContext,
    signal?: AbortSignal,
  ): Promise<Result<ModelOutput>>;
  stream(
    request: ModelRequest,
    context: RequestContext,
    signal?: AbortSignal,
  ): AsyncIterable<ModelChunk>;
  embed(
    texts: string[],
    request: ModelRequest,
    context: RequestContext,
    signal?: AbortSignal,
  ): Promise<Result<number[][]>>;
  probeCapabilities(routeId: string, context: RequestContext): Promise<Result<ModelCapability[]>>;
  estimateUsage(
    request: ModelRequest,
  ): Result<{ inputTokens: number | null; maxOutputTokens: number; estimatedCost: number | null }>;
}
