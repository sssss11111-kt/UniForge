export type EntityId = string;
export type IsoUtc = string;
export type Result<T, E = DomainValidationError> = { ok: true; value: T } | { ok: false; error: E };
export type DomainValidationError = {
  code: 'INVALID_ID' | 'INVALID_UTC' | 'INVALID_VERSION' | 'INVALID_INPUT';
  message: string;
};

const idPattern = /^[A-Za-z][A-Za-z0-9_-]{1,127}$/;
const utcPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export function parseEntityId(value: string): Result<EntityId> {
  return idPattern.test(value)
    ? { ok: true, value }
    : {
        ok: false,
        error: { code: 'INVALID_ID', message: 'Entity ID must be a safe canonical identifier' },
      };
}
export function parseIsoUtc(value: string): Result<IsoUtc> {
  const date = new Date(value);
  return utcPattern.test(value) && !Number.isNaN(date.valueOf()) && date.toISOString() === value
    ? { ok: true, value }
    : {
        ok: false,
        error: { code: 'INVALID_UTC', message: 'Timestamp must be canonical UTC ISO-8601' },
      };
}
export function serializeDomainValue(value: unknown): string {
  return JSON.stringify(value);
}
export function deserializeDomainValue<T>(value: string): T {
  return JSON.parse(value) as T;
}
