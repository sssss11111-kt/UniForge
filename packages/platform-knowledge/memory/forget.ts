import { randomUUID } from 'node:crypto';
import type { Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
import type { PersonalCore } from './personal-core.js';
export function forgetClaim(
  core: PersonalCore,
  claimId: string,
): Result<{ claimId: string; tombstoneId: string }> {
  const found = core.db.prepare('SELECT claim_id FROM memory_claims WHERE claim_id=?').get(claimId);
  if (!found) return failure('NOT_FOUND', 'Claim not found');
  const at = new Date().toISOString();
  core.db.exec('BEGIN');
  try {
    core.db
      .prepare(
        'UPDATE memory_claims SET outcome=?, reviewed_at=?, version=version+1 WHERE claim_id=?',
      )
      .run('FORGOTTEN', at, claimId);
    core.db.prepare('DELETE FROM claim_evidence WHERE claim_id=?').run(claimId);
    core.db.prepare('INSERT OR REPLACE INTO forget_tombstones VALUES (?,?)').run(claimId, at);
    core.db
      .prepare('INSERT INTO outcomes VALUES (?,?,?,?)')
      .run(`outcome-${randomUUID()}`, claimId, 'FORGOTTEN', at);
    core.db.exec('COMMIT');
    return { ok: true, value: { claimId, tombstoneId: claimId } };
  } catch (error) {
    core.db.exec('ROLLBACK');
    return failure('UNAVAILABLE', `Forget transaction failed: ${String(error)}`);
  }
}
