/** @typedef {'neutral'|'success'|'warning'|'danger'|'approval'|'running'|'paused'} StatusTone */

export function isViewModel(value) {
  return Boolean(value && typeof value === 'object');
}
