const STATES = new Set([
  'loading',
  'empty',
  'ready',
  'error',
  'offline',
  'read-only',
  'permission-denied',
  'approval-required',
  'roadmap',
]);

export function normalizeState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object')
    return { state: 'error', message: 'INVALID_VIEW_STATE' };
  const candidate = snapshot.state;
  if (typeof candidate === 'string' && STATES.has(candidate)) {
    return {
      state: candidate,
      ...(typeof snapshot.message === 'string' ? { message: snapshot.message } : {}),
      ...(typeof snapshot.diagnosticRef === 'string'
        ? { diagnosticRef: snapshot.diagnosticRef }
        : {}),
    };
  }
  return { state: 'error', message: 'INVALID_VIEW_STATE' };
}

export function stateForSnapshot(snapshot, { empty = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') return 'error';
  if (snapshot.state && STATES.has(snapshot.state)) return snapshot.state;
  return empty ? 'empty' : 'ready';
}

export function errorState(error) {
  const message = error instanceof Error ? error.message : String(error ?? 'UNKNOWN_ERROR');
  const diagnosticRef =
    error && typeof error === 'object' && typeof error.diagnosticRef === 'string'
      ? error.diagnosticRef
      : undefined;
  return {
    state: 'error',
    error: { message, ...(diagnosticRef ? { diagnosticRef } : {}) },
  };
}
