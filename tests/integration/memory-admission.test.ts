import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import {
  PersonalCore,
  MemoryService,
  forgetClaim,
} from '../../packages/platform-knowledge/index.js';
describe('memory admission', () => {
  it('requires evidence and authorization, then forgets with a tombstone', () => {
    const core = new PersonalCore(new DatabaseSync(':memory:'));
    const service = new MemoryService(core);
    const rr = service.recordReceipt({
      sourceType: 'user',
      sourceRef: 'synthetic',
      content: 'prefers local',
      capturedAt: '2026-09-05T00:00:00.000Z' as never,
    });
    expect(rr.ok).toBe(true);
    if (!rr.ok) return;
    const receipt = rr.value;
    expect(service.propose(receipt.receiptId, 'prefers local', 'PERSONAL').ok).toBe(false);
    service.addEvidence(receipt.receiptId, {
      sourceType: 'user',
      sourceRef: 'synthetic',
      capturedAt: receipt.capturedAt,
    });
    const candidateResult = service.propose(receipt.receiptId, 'prefers local', 'PERSONAL');
    expect(candidateResult.ok).toBe(true);
    if (!candidateResult.ok) return;
    const candidate = candidateResult.value;
    const claimResult = service.accept(candidate.candidateId, 'USER_CONFIRMED');
    expect(claimResult.ok).toBe(true);
    if (!claimResult.ok) return;
    expect(claimResult.value.outcome).toBe('ADMITTED');
    const forgotten = forgetClaim(core, claimResult.value.claimId);
    if (!forgotten.ok) throw new Error(forgotten.error.message);
    expect(service.list('PERSONAL')).toEqual([]);
    core.close();
  });
});
