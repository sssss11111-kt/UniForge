import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { PersonalCore, MemoryService } from '../../packages/platform-knowledge/index.js';
describe('memory scope', () => {
  it('filters claims by scope', () => {
    const core = new PersonalCore(new DatabaseSync(':memory:'));
    const s = new MemoryService(core);
    const rr = s.recordReceipt({
      sourceType: 'user',
      sourceRef: 'x',
      content: 'x',
      capturedAt: '2026-09-05T00:00:00.000Z' as never,
    });
    expect(rr.ok).toBe(true);
    if (!rr.ok) return;
    const r = rr.value;
    s.addEvidence(r.receiptId, { sourceType: 'user', sourceRef: 'x', capturedAt: r.capturedAt });
    const cr = s.propose(r.receiptId, 'x', 'PERSONAL');
    expect(cr.ok).toBe(true);
    if (!cr.ok) return;
    s.accept(cr.value.candidateId, 'USER_CONFIRMED');
    expect(s.list('WORKSPACE')).toHaveLength(0);
    expect(s.list('PERSONAL')).toHaveLength(1);
    core.close();
  });
});
