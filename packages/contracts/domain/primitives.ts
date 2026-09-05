export type Id<K extends string> = string & { readonly __kind: K };
export type Instant = string & { readonly __utcIso: true };
export type EntityId = Id<'entity'>;
export type IsoUtc = Instant;
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type FailureCode =
  | 'INVALID_INPUT'
  | 'INVALID_TRANSITION'
  | 'DENIED'
  | 'PROTECTED_PATH'
  | 'EXPIRED'
  | 'APPROVAL_REQUIRED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'BUDGET_EXCEEDED'
  | 'CAPABILITY_MISMATCH'
  | 'MIGRATION_FAILED'
  | 'CORRUPT_BACKUP';
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: FailureCode; message: string; correlationId: string } };
export interface Entity<K extends string> {
  id: Id<K>;
  workspaceId: Id<'workspace'>;
  version: number;
  createdAt: Instant;
  updatedAt: Instant;
}
export interface EvidenceRef {
  sourceId: Id<'source'>;
  locator: string;
  contentHash: string;
  collectedAt: Instant;
  processorVersion?: string;
}
export interface RequestContext {
  actorId: Id<'actor'>;
  workspaceId: Id<'workspace'>;
  runId?: Id<'agent-run'>;
  correlationId: string;
}
export function failure(
  code: FailureCode,
  message: string,
  correlationId = 'system',
): Result<never> {
  return { ok: false, error: { code, message, correlationId } };
}
const idPattern = /^[A-Za-z][A-Za-z0-9_-]{1,127}$/;
export function parseId<K extends string>(
  kind: K,
  value: string,
  correlationId = 'system',
): Result<Id<K>> {
  return idPattern.test(value)
    ? { ok: true, value: value as Id<K> }
    : failure('INVALID_INPUT', `Invalid ${kind} id`, correlationId);
}
export function parseInstant(value: string, correlationId = 'system'): Result<Instant> {
  const date = new Date(value);
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    !Number.isNaN(date.valueOf()) &&
    date.toISOString() === value
    ? { ok: true, value: value as Instant }
    : failure('INVALID_INPUT', 'Timestamp must be canonical UTC ISO-8601', correlationId);
}
export const parseEntityId = (value: string, correlationId?: string): Result<Id<'entity'>> =>
  parseId('entity', value, correlationId);
export const parseIsoUtc = (value: string, correlationId?: string): Result<Instant> =>
  parseInstant(value, correlationId);
export function serializeDomainValue(value: Json): string {
  return JSON.stringify(value);
}
export function deserializeDomainValue<T extends Json>(value: string): T {
  return JSON.parse(value) as T;
}
