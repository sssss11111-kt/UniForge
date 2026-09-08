const STATES = new Set([
  'loading',
  'empty',
  'ready',
  'error',
  'offline',
  'read-only',
  'permission-denied',
  'approval-required',
]);

export function normalizeState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { state: 'empty' };
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
  return { state: 'ready' };
}
