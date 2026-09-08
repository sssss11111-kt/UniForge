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

  it('retains evidence provenance and records an explicit outcome', () => {
    const core = new PersonalCore(new DatabaseSync(':memory:'));
    const service = new MemoryService(core);
    const receipt = service.recordReceipt({
      sourceType: 'conversation',
      sourceRef: 'conversation:42',
      content: 'prefers local',
      capturedAt: '2026-09-05T00:00:00.000Z' as never,
    });
    if (!receipt.ok) throw new Error(receipt.error.message);
    const evidence = service.addEvidence(receipt.value.receiptId, {
      sourceType: 'conversation',
      sourceRef: 'conversation:42#message:3',
      capturedAt: receipt.value.capturedAt,
    });
    if (!evidence.ok) throw new Error(evidence.error.message);
    const candidate = service.propose(receipt.value.receiptId, 'prefers local', 'PERSONAL');
    if (!candidate.ok) throw new Error(candidate.error.message);
    expect(candidate.value.evidence.map((item) => item.evidenceId)).toEqual([evidence.value]);
    const claim = service.accept(candidate.value.candidateId, 'USER_CONFIRMED', ['memory:write']);
    if (!claim.ok) throw new Error(claim.error.message);
    expect(claim.value.evidenceIds).toEqual([evidence.value]);
    expect(service.list('PERSONAL')[0]?.evidenceIds).toEqual([evidence.value]);
    expect(
      core.db.prepare('SELECT outcome FROM outcomes WHERE claim_id=?').get(claim.value.claimId),
    ).toMatchObject({ outcome: 'ADMITTED' });
    core.close();
  });

  it('denies admission without write permission and marks dependent derived state stale on forget', () => {
    const core = new PersonalCore(new DatabaseSync(':memory:'));
    const service = new MemoryService(core);
    const receipt = service.recordReceipt({
      sourceType: 'user',
      sourceRef: 'user',
      content: 'x',
      capturedAt: '2026-09-05T00:00:00.000Z' as never,
    });
    if (!receipt.ok) throw new Error(receipt.error.message);
    const evidence = service.addEvidence(receipt.value.receiptId, {
      sourceType: 'user',
      sourceRef: 'user',
      capturedAt: receipt.value.capturedAt,
    });
    if (!evidence.ok) throw new Error(evidence.error.message);
    const candidate = service.propose(receipt.value.receiptId, 'x', 'PERSONAL');
    if (!candidate.ok) throw new Error(candidate.error.message);
    expect(service.accept(candidate.value.candidateId, 'USER_CONFIRMED', [])).toMatchObject({
      ok: false,
      error: { code: 'DENIED' },
    });
    const admitted = service.accept(candidate.value.candidateId, 'USER_CONFIRMED', [
      'memory:write',
    ]);
    if (!admitted.ok) throw new Error(admitted.error.message);
    service.registerDerivedState(admitted.value.claimId, 'memory-search');
    expect(service.isDerivedStateValid(admitted.value.claimId, 'memory-search')).toBe(true);
    const forgotten = forgetClaim(core, admitted.value.claimId, ['memory:forget']);
    expect(forgotten.ok).toBe(true);
    expect(service.isDerivedStateValid(admitted.value.claimId, 'memory-search')).toBe(false);
    core.close();
  });

  it('keeps conflicting candidates pending until resolved', () => {
    const core = new PersonalCore(new DatabaseSync(':memory:'));
    const service = new MemoryService(core);
    const make = (ref: string) => {
      const receipt = service.recordReceipt({
        sourceType: 'user',
        sourceRef: ref,
        content: 'same',
        capturedAt: '2026-09-05T00:00:00.000Z' as never,
      });
      if (!receipt.ok) throw new Error(receipt.error.message);
      service.addEvidence(receipt.value.receiptId, {
        sourceType: 'user',
        sourceRef: ref,
        capturedAt: receipt.value.capturedAt,
      });
      return receipt.value;
    };
    const first = service.propose(make('one').receiptId, 'same', 'PERSONAL');
    if (!first.ok) throw new Error(first.error.message);
    const admitted = service.accept(first.value.candidateId, 'USER_CONFIRMED', ['memory:write']);
    if (!admitted.ok) throw new Error(admitted.error.message);
    const second = service.propose(make('two').receiptId, 'same', 'PERSONAL');
    if (!second.ok) throw new Error(second.error.message);
    expect(
      service.accept(second.value.candidateId, 'USER_CONFIRMED', ['memory:write']),
    ).toMatchObject({ ok: false, error: { code: 'CONFLICT' } });
    core.close();
  });
});
