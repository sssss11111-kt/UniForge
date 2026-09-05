# Task 0.16 — Windows Build / 安装 / 升级回滚 PoC

Status: PARTIAL / BLOCKED pending clean Windows VM installer verification.

The package script runs quality gates, compiles the desktop, stages compiled Main/Preload/Renderer and contracts, invokes Forge/Squirrel for a win32 x64 preview artifact, and emits SHA-256 hashes. The native binding test executes real `node:sqlite` CRUD and FTS5. The manifest marks the package unsigned and the three reviewed sidecar engines `BLOCKED`; no unreviewed engine or update service is bundled.

| Check                                                 | Result                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Host                                                  | Windows x64, Node 24.18.0                                                                                          |
| Native SQLite CRUD + FTS5                             | PASS: `npm run unit -- tests/packaging/native-binding.test.ts` (1 file, 1 test)                                    |
| TypeScript and lint                                   | PASS: `npm run typecheck`; `npm run lint`                                                                          |
| Package pipeline                                      | BLOCKED: `npm run package-windows` stopped at format:check on pre-existing Task 0.12 LangGraph formatting findings |
| Clean install / launch / uninstall / upgrade rollback | BLOCKED: isolated clean Windows VM not available in this execution                                                 |
| OCR / speech / document health                        | BLOCKED: reviewed engine executables are not bundled                                                               |

Rollback is limited to deleting the disposable preview install and restoring a verified compatible app/data snapshot. This PoC does not implement automatic updates.
