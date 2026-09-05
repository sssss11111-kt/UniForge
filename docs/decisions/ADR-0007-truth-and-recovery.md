# ADR-0007 — Knowledge truth and Personal Memory recovery

## Decision

Markdown in the selected Vault is the sole source of note正文. The FTS5 database is a rebuildable derived index and stores source hashes and citations. Personal Memory uses an isolated synthetic PoC SQLite store; conversation receipts never become claims without evidence and explicit authorization.

Forget marks a claim forgotten, removes claim/evidence relations, records an outcome, and leaves a minimal tombstone containing no claim text. Scope is filtered at admission and query boundaries. Semantic retrieval is intentionally not enabled in Stage 0.

## Evidence and rollback

Task 0.13 integration, scope, recovery tests and `poc:knowledge` provide evidence. The synthetic index can be deleted and rebuilt from authorized Markdown sources. This PoC never connects to a real Vault or Personal Core and makes no Bok integration claim.
