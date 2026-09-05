# Task 0.4 — Domain Events and Projections

Status: implementation checkpoint; Stage 0 acceptance remains pending.

Implemented a SQLite domain event store with workspace-scoped reads, monotonic storage sequence, aggregate-version uniqueness, event-id uniqueness, JSON payload persistence, and a projection offset store supporting idempotent incremental projection and rebuild from immutable events. `FoundationService` provides the small foundation command path through the existing UnitOfWork port; unsupported commands return `UNAVAILABLE`.

No provider, Agent runtime, permission, IPC, or UI code was added.

Environment: Windows, Node v24.18.0, Vitest 5.0.0.

| Command                                                                                                                                                                                                                                                                                                                                          | Result                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| `npx vitest run packages/infrastructure/sqlite/event-store tests/integration/foundation-command.test.ts tests/recovery/projection-rebuild.test.ts packages/infrastructure/sqlite/migration.test.ts packages/infrastructure/sqlite/transaction.test.ts packages/infrastructure/sqlite/repositories.test.ts tests/recovery/sqlite-restart.test.ts` | PASS: 7 files, 10 tests |
| `npm run typecheck`                                                                                                                                                                                                                                                                                                                              | PASS                    |
| `npm run lint`                                                                                                                                                                                                                                                                                                                                   | PASS                    |
| `npm run format:check`                                                                                                                                                                                                                                                                                                                           | PASS                    |
| `npm run check-boundaries`                                                                                                                                                                                                                                                                                                                       | PASS                    |
| `npm run check-doc-links`                                                                                                                                                                                                                                                                                                                        | PASS                    |

Known limitation: event contract compatibility still follows the existing Contract V1 types, while the storage envelope adds infrastructure metadata. Full business plus event atomicity is exercised through the UnitOfWork seam and will receive broader integration coverage as later foundation services are implemented. This checkpoint does not claim Stage 0 acceptance.

Rollback: revert the task checkpoint after verifying its SHA; rebuild projections from the retained immutable domain event history. Never delete domain events or downgrade a live database schema as a code rollback.
