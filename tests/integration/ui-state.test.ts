import { expect, test } from 'vitest';
const modulePath = '../../apps/desktop/src/renderer/ui/state.js';
const { normalizeState } = await import(modulePath);

test('unknown or malformed states never imply successful loading', () => {
  for (const value of [null, undefined, {}, { state: 'unknown' }, { state: 'COMPLETED' }]) {
    expect(normalizeState(value).state).toBe('error');
  }
});

test('explicit states retain diagnostic information', () => {
  expect(normalizeState({ state: 'empty' })).toEqual({ state: 'empty' });
  expect(normalizeState({ state: 'error', message: 'Unavailable', diagnosticRef: 'd1' })).toEqual({
    state: 'error',
    message: 'Unavailable',
    diagnosticRef: 'd1',
  });
});
