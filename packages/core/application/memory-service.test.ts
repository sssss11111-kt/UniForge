import { describe, expect, it } from 'vitest';
import { MemoryService } from './memory-service.js';
const id = (value: string) => value as never;
const instant = (value: string) => value as never;
describe('MemoryService', () => {
  it('admits provenance-bearing claims and supports forgetting', () => {
    const s = new MemoryService();
    s.admit({
      claim: {
        claimId: id('m'),
        candidateId: id('c'),
        claim: 'prefers concise answers',
        evidenceIds: [id('r')],
        outcome: 'ADMITTED',
        createdAt: instant('2026-09-06T00:00:00Z'),
      },
      permissions: ['memory:write'],
    });
    expect(s.forget(id('m'), ['memory:forget']).outcome).toBe('FORGOTTEN');
  });
  it('requires provenance and permissions', () => {
    const s = new MemoryService();
    expect(() =>
      s.admit({
        claim: {
          claimId: id('m'),
          candidateId: id('c'),
          claim: 'x',
          evidenceIds: [],
          outcome: 'ADMITTED',
          createdAt: instant('2026-09-06T00:00:00Z'),
        },
        permissions: ['memory:write'],
      }),
    ).toThrow('Provenance');
  });
});
