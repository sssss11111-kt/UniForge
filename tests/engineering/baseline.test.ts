import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('engineering baseline', () => {
  it('uses strict TypeScript and a lockfile', () => {
    expect(readFileSync('tsconfig.base.json', 'utf8')).toMatch(/"strict"\s*:\s*true/);
    expect(() => readFileSync('package-lock.json')).not.toThrow();
  });
});
