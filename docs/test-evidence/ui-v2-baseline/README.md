# UI V2 Renderer baseline evidence

Date: 2026-09-07

This checkpoint records the Renderer contract before the UI V2 migration. The
baseline test intentionally preserves the seven primary module identifiers and
the current roadmap boundary. The removed `development` module is explicitly
excluded.

## Commands

| Command                                                      | Result                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `npx vitest run tests/integration/ui-shell-contract.test.ts` | PASS — 1 file, 2 tests                                                              |
| `npm run typecheck`                                          | PASS                                                                                |
| `npm run unit`                                               | PASS — 70 files, 168 tests                                                          |
| `npm run e2e-smoke`                                          | BLOCKED — Electron launch test timed out after 30s before a window became available |

Raw command output is kept beside this file. The E2E timeout is recorded as a
known baseline failure; assertions were not weakened to make the checkpoint
pass. The next implementation task must restore a deterministic Electron
launch and then rerun the unchanged shell contract.

The current app screenshot could not be captured through the Electron smoke
test because the main process did not expose a window within the test timeout.
