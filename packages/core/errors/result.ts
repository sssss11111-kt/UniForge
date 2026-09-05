export type CoreErrorCode =
  'INVALID_TRANSITION' | 'VERSION_CONFLICT' | 'NOT_FOUND' | 'DENIED' | 'INVALID_INPUT';
export interface CoreError {
  code: CoreErrorCode;
  message: string;
}
export type Result<T> = { ok: true; value: T } | { ok: false; error: CoreError };
