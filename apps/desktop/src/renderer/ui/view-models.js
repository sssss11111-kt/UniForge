/** @typedef {'neutral'|'success'|'warning'|'danger'|'approval'|'running'|'paused'} StatusTone */

export function isViewModel(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function snapshotViewModel(snapshot, empty) {
  if (!isViewModel(snapshot) || 'error' in snapshot) {
    return { state: 'error', error: { message: 'INVALID_SNAPSHOT' } };
  }
  if (snapshot.state === 'error') return snapshot;
  return { state: empty ? 'empty' : 'ready', ...snapshot };
}
