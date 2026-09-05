# Task 0.15 — Diagnostics, recycle bin, and backup foundation

Date: 2026-09-05  
Status: PASS (PoC)

## Delivered

- Structured JSONL logging with recursive secret redaction and explicit crash entries.
- Domain recycle-bin service with 30-day retention metadata, restore, expiry purge, and search visibility rules.
- Allowlisted backup manifest with schema version, SHA-256 managed-file entries, secret/credential exclusion, corruption checks, and restore through a temporary directory before replacement.

Ordinary backups exclude credential-like fields, cookies, login state, raw chat/voice, Git credentials, and Personal Core. Only explicitly authorized managed files are included.

## Verification

Commands run from `C:/Users/Tong/Documents/ChatGPT/New project`:

- `npm run typecheck` — exit 0
- `npm run lint` — exit 0
- `npm run unit -- tests/integration/diagnostics-backup.test.ts packages/core/domain/recycle-bin/service.test.ts` — 4 tests passed
- `npm run check-boundaries` — exit 0
- `npm run check-doc-links` — exit 0

## Rollback

Revert the Task 0.15 commit. Existing domain migrations and earlier stage contracts remain unchanged; any generated backup or log files are user data and are not removed by code rollback.
