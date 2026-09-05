# Task 0.5 — Permission and Approval Kernel

Status: implementation checkpoint; Stage 0 acceptance remains pending.

Implemented a fail-closed policy evaluator, temporary grant store, protected-resource hard deny list, and approval service. High risk and external-send operations require exact approval. Approval decisions are bound to workspace, requesting actor, payload, tool version, risk and expiry, and a consumed approval cannot be reused. User resolution requires a trusted Main-created context token.

Stage 0 process/CLI/MCP/filesystem capabilities remain unavailable pending their later boundary implementations. Protected UniForge source, installation, updater, migration, permission-kernel, and build resources cannot be approved.

Environment: Windows, Node v24.18.0, Vitest 5.0.0.

| Command                                                                                                                                                                         | Result                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `npx vitest run packages/core/permissions/policy.test.ts packages/core/approvals/service.test.ts tests/security/approval-replay.test.ts tests/security/cross-workspace.test.ts` | PASS: 4 files, 6 tests |
| `npm run typecheck`                                                                                                                                                             | PASS                   |
| `npm run lint`                                                                                                                                                                  | PASS                   |
| `npm run format:check`                                                                                                                                                          | PASS                   |
| `npm run check-boundaries`                                                                                                                                                      | PASS                   |
| `npm run check-doc-links`                                                                                                                                                       | PASS                   |

Known limitation: this checkpoint uses an in-memory approval/grant store. Durable SQLite persistence and transaction integration belong to the application service integration work and require the existing database ports; no IPC or renderer identity is introduced here. Full OS path canonicalization remains Task 0.7.

Rollback: revoke active grants, disable newly registered capabilities, preserve pending approval history, then revert this checkpoint after verifying its SHA. Do not weaken hard protected-resource denies as a rollback mechanism.
