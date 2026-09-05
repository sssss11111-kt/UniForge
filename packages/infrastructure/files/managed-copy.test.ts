import { describe, expect, it } from 'vitest';
import { isWithin } from './authorized-path.js';
import { assertAuthorizedWritable } from './protected-path-policy.js';
describe('workspace ownership', () => {
  it('rejects traversal', () =>
    expect(isWithin('C:/workspace', 'C:/workspace/../other')).toBe(false));
  it('rejects protected paths', () =>
    expect(() => assertAuthorizedWritable('C:/workspace', 'C:/workspace/.git/config')).toThrow(
      'PROTECTED_PATH',
    ));
});
