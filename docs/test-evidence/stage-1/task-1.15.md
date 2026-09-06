# Stage 1 Task 1.15 — Backup / Recycle / Exit

## Scope

This vertical slice adds a typed backup, recycle-bin, and exit surface. Backups use the existing verified manifest format and reject destinations outside the authorized workspace. Recycle entries retain the existing 30-day retention semantics and can be restored. Exit decisions distinguish close-to-tray, unsaved-change confirmation, and full exit; full shutdown runs every registered participant and preserves failures. Electron exposes these operations through typed contracts and a narrow preload API, with a minimal renderer status surface.

## Validation

Environment: Windows, Node/npm from the repository toolchain, 2026-09-06.

| Command                                                                                                                                | Result                   |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npx vitest run packages/core/domain/lifecycle/service.test.ts tests/integration/diagnostics-backup.test.ts --config vitest.config.ts` | PASS — 2 files, 6 tests  |
| `npm run integration`                                                                                                                  | PASS — 8 files, 12 tests |
| `npm run typecheck`                                                                                                                    | PASS                     |
| `npm run lint`                                                                                                                         | PASS                     |
| `npm run build:desktop`                                                                                                                | PASS                     |
| `npm run check-boundaries`                                                                                                             | PASS                     |
| `npm run check-doc-links`                                                                                                              | PASS                     |
| `npx prettier --check ...` (changed files)                                                                                             | PASS                     |
| `git diff --check`                                                                                                                     | PASS                     |

The boundary test proves an escaped backup destination returns `PROTECTED_PATH`; the round-trip test proves authorized managed content remains verifiable and restorable while excluded content and secret fields are omitted. Exit tests prove unsaved confirmation, close-to-tray without shutdown, all participant shutdown attempts, and visible shutdown failures.

## Limits

The default desktop coordinator has no long-running participant registrations yet; later runtime integrations should inject Agent, Connector, News, cloud-request, and background-collection stop participants. No Windows resident service is introduced. Full E2E packaging was not rerun because this task changes the existing desktop vertical slice and the focused desktop build is the applicable gate.
