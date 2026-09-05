import { describe, expect, it } from 'vitest';
import { isProtectedPath } from '../../packages/infrastructure/files/protected-path-policy.js';
describe('windows boundaries', () =>
  it('protects updater', () => expect(isProtectedPath('C:/app/updater/a')).toBe(true)));
