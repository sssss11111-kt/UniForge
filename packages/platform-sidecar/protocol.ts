import type { Json, Result } from '@uniforge/contracts';

export const SIDECAR_PROTOCOL_VERSION = 1 as const;
export type SidecarMethod =
  'start' | 'stop' | 'health' | 'request' | 'cancel' | 'version' | 'shutdown';
export interface SidecarRequest {
  protocolVersion: 1;
  requestId: string;
  correlationId: string;
  method: SidecarMethod;
  deadline: string;
  payload?: Json;
}
export interface SidecarResponse {
  protocolVersion: 1;
  requestId: string;
  ok: boolean;
  result?: Json;
  error?: { code: string; message: string };
}
export interface SidecarError {
  code: string;
  message: string;
  correlationId: string;
}
export type SidecarResult<T> = Result<T>;
export const isSidecarResponse = (value: unknown): value is SidecarResponse => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.protocolVersion === 1 &&
    typeof v.requestId === 'string' &&
    typeof v.ok === 'boolean' &&
    (v.ok ? !('error' in v) : typeof v.error === 'object' && v.error !== null)
  );
};
