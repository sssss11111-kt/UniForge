# Task 0.3 — SQLite Schema and Migration Evidence

Status: implementation checkpoint; Stage 0 acceptance remains pending.

## Scope

Implemented the infrastructure-only SQLite foundation using Node 24's built-in `node:sqlite` binding. The Domain/Core packages do not import the binding. The versioned foundation migration creates the approved Stage 0 tables with foreign-key, JSON, CHECK, UNIQUE, and index constraints. Migration checksums are stored and mismatches fail closed. Transactions use `BEGIN IMMEDIATE`, rollback on error, and integrity checks before commit.

## Verification

Environment: Windows, Node v24.18.0, npm/Vitest from the repository lockfile.

Commands run from `C:\Users\Tong\Documents\ChatGPT\uniforge-stage-0`:

| Command                                                                               | Result        |
| ------------------------------------------------------------------------------------- | ------------- |
| `npx vitest run packages/infrastructure/sqlite tests/recovery/sqlite-restart.test.ts` | PASS: 7 tests |
| `npm run typecheck`                                                                   | PASS          |
| `npm run lint`                                                                        | PASS          |
| `npm run format:check`                                                                | PASS          |
| `npm run check-boundaries`                                                            | PASS          |

The focused tests cover empty-to-latest and idempotent migration, legacy version upgrade, checksum mismatch, invalid migration rollback, transaction rollback, FK/UNIQUE enforcement, repository round trips, and data retention after close/reopen.

## Dependency and security notes

No production dependency was added. `node:sqlite` is provided by the already pinned Node runtime and uses parameterized statements for repository writes and reads. This checkpoint still needs real packaged Electron/Windows ABI validation in Task 0.16. Migration snapshots and full backup/restore policy remain Task 0.15 scope.

## Rollback

Stop application writes, preserve the migration failure database for diagnosis, verify a migration snapshot, and restore to a new temporary database before switching. Code rollback must use `git revert` after verifying this checkpoint; it must not downgrade a live database schema.
