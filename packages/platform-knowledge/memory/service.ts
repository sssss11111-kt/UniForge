import { createHash, randomUUID } from 'node:crypto';
import type {
  MemoryAuthorization,
  MemoryCandidate,
  MemoryClaim,
  MemoryReceipt,
} from '@uniforge/contracts/domain/memory.js';
import type { EntityId, Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
import type { PersonalCore } from './personal-core.js';
const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${randomUUID()}`;
const asResult = <T>(value: T): Result<T> => ({ ok: true, value });
export class MemoryService {
  constructor(private readonly core: PersonalCore) {}
  recordReceipt(
    input: Omit<MemoryReceipt, 'receiptId'> & { receiptId?: string },
  ): Result<MemoryReceipt> {
    const receipt: MemoryReceipt = {
      ...input,
      receiptId: (input.receiptId ?? id('receipt')) as EntityId,
    };
    this.core.db
      .prepare('INSERT INTO receipts VALUES (?,?,?,?,?)')
      .run(
        receipt.receiptId,
        receipt.sourceType,
        receipt.sourceRef,
        receipt.content,
        receipt.capturedAt,
      );
    return asResult(receipt);
  }
  addEvidence(
    receiptId: string,
    input: {
      sourceType: 'conversation' | 'document' | 'user';
      sourceRef: string;
      capturedAt: string;
    },
  ): Result<string> {
    const receipt = this.core.db
      .prepare('SELECT receipt_id FROM receipts WHERE receipt_id=?')
      .get(receiptId);
    if (!receipt) return failure('NOT_FOUND', 'Receipt not found');
    const evidenceId = id('evidence');
    const contentHash = createHash('sha256').update(input.sourceRef).digest('hex');
    this.core.db
      .prepare('INSERT INTO evidence VALUES (?,?,?,?,?,?)')
      .run(evidenceId, receiptId, input.sourceType, input.sourceRef, contentHash, input.capturedAt);
    return asResult(evidenceId);
  }
  propose(
    receiptId: string,
    claim: string,
    scope: 'PERSONAL' | 'WORKSPACE',
    confidence = 0.5,
    source = 'receipt',
  ): Result<MemoryCandidate> {
    const receipt = this.core.db
      .prepare('SELECT receipt_id FROM receipts WHERE receipt_id=?')
      .get(receiptId);
    if (!receipt) return failure('NOT_FOUND', 'Receipt not found');
    const evidence = this.core.db
      .prepare(
        'SELECT evidence_id, source_type, source_ref, content_hash, captured_at FROM evidence WHERE receipt_id=? ORDER BY evidence_id',
      )
      .all(receiptId) as Record<string, unknown>[];
    if (!evidence.length) return failure('DENIED', 'Memory requires evidence');
    if (confidence < 0 || confidence > 1)
      return failure('INVALID_INPUT', 'Confidence must be between 0 and 1');
    const conflict = this.core.db
      .prepare('SELECT claim_id FROM memory_claims WHERE claim=? AND scope=? AND outcome=?')
      .get(claim, scope, 'ADMITTED');
    const candidate: MemoryCandidate = {
      candidateId: id('candidate') as EntityId,
      claim,
      evidence: evidence.map((item) => ({
        evidenceId: String(item.evidence_id) as EntityId,
        sourceType: String(item.source_type) as 'conversation' | 'document' | 'user',
        sourceRef: String(item.source_ref),
        capturedAt: String(item.captured_at) as MemoryCandidate['createdAt'],
        ...(item.content_hash ? { contentHash: String(item.content_hash) } : {}),
      })),
      scope,
      createdAt: now() as MemoryCandidate['createdAt'],
      confidence,
      source,
    };
    this.core.db
      .prepare('INSERT INTO memory_candidates VALUES (?,?,?,?,?,?,?,?)')
      .run(
        candidate.candidateId,
        receiptId,
        claim,
        scope,
        confidence,
        source,
        candidate.createdAt,
        conflict ? 'CONFLICT' : 'PENDING',
      );
    return asResult(candidate);
  }
  accept(
    candidateId: string,
    authorization: MemoryAuthorization,
    permissions?: readonly string[],
  ): Result<MemoryClaim> {
    if (permissions && !permissions.includes('memory:write'))
      return failure('DENIED', 'Missing permission: memory:write');
    if (authorization !== 'USER_CONFIRMED' && authorization !== 'RULE_CONFIRMED')
      return failure('DENIED', 'Explicit authorization is required');
    const c = this.core.db
      .prepare('SELECT * FROM memory_candidates WHERE candidate_id=?')
      .get(candidateId) as Record<string, unknown> | undefined;
    if (!c) return failure('NOT_FOUND', 'Candidate not found');
    if (c.status === 'CONFLICT')
      return failure('CONFLICT', 'Conflicting candidate requires resolution');
    const evidence = this.core.db
      .prepare('SELECT evidence_id FROM evidence WHERE receipt_id=?')
      .all(String(c.receipt_id)) as Record<string, unknown>[];
    if (!evidence.length) return failure('DENIED', 'Memory requires evidence');
    const claimId = id('claim');
    const createdAt = now();
    const claimScope = String(c.scope) as 'PERSONAL' | 'WORKSPACE';
    this.core.db
      .prepare('INSERT INTO memory_claims VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(
        claimId,
        candidateId,
        String(c.claim),
        claimScope,
        authorization,
        Number(c.confidence),
        String(c.source),
        'ADMITTED',
        createdAt,
        createdAt,
        1,
      );
    for (const e of evidence)
      this.core.db
        .prepare('INSERT INTO claim_evidence VALUES (?,?)')
        .run(claimId, String(e.evidence_id));
    this.core.db
      .prepare('INSERT INTO outcomes VALUES (?,?,?,?)')
      .run(`outcome-${randomUUID()}`, claimId, 'ADMITTED', createdAt);
    return asResult<MemoryClaim>({
      claimId: claimId as EntityId,
      candidateId: candidateId as EntityId,
      claim: String(c.claim),
      evidenceIds: evidence.map((e) => String(e.evidence_id) as EntityId),
      outcome: 'ADMITTED',
      createdAt: createdAt as MemoryClaim['createdAt'],
      reviewedAt: createdAt as NonNullable<MemoryClaim['reviewedAt']>,
      version: 1,
      scope: claimScope,
      authorization,
      confidence: Number(c.confidence),
      source: String(c.source),
    });
  }
  list(scope: 'PERSONAL' | 'WORKSPACE'): MemoryClaim[] {
    const rows = this.core.db
      .prepare('SELECT * FROM memory_claims WHERE scope=? AND outcome=?')
      .all(scope, 'ADMITTED') as Record<string, unknown>[];
    return rows.map((r) => ({
      claimId: String(r.claim_id) as EntityId,
      candidateId: String(r.candidate_id) as EntityId,
      claim: String(r.claim),
      evidenceIds: (
        this.core.db
          .prepare('SELECT evidence_id FROM claim_evidence WHERE claim_id=? ORDER BY evidence_id')
          .all(String(r.claim_id)) as Record<string, unknown>[]
      ).map((e) => String(e.evidence_id) as EntityId),
      outcome: 'ADMITTED',
      createdAt: String(r.created_at) as MemoryClaim['createdAt'],
      scope,
      authorization: r.authorization as MemoryAuthorization,
      confidence: Number(r.confidence),
      source: String(r.source),
      version: Number(r.version),
    }));
  }
  registerDerivedState(claimId: string, derivedId: string): Result<void> {
    const claim = this.core.db
      .prepare('SELECT claim_id FROM memory_claims WHERE claim_id=?')
      .get(claimId);
    if (!claim) return failure('NOT_FOUND', 'Claim not found');
    this.core.db
      .prepare(
        'INSERT OR REPLACE INTO memory_derived_state (claim_id,derived_id,valid,invalidated_at) VALUES (?,?,1,NULL)',
      )
      .run(claimId, derivedId);
    return { ok: true, value: undefined };
  }
  isDerivedStateValid(claimId: string, derivedId: string): boolean {
    const row = this.core.db
      .prepare('SELECT valid FROM memory_derived_state WHERE claim_id=? AND derived_id=?')
      .get(claimId, derivedId) as { valid?: number } | undefined;
    return row?.valid === 1;
  }
}
