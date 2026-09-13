# Stage 3 Task 3.8 — Acceptance

Executed 2026-09-08 against the Stage 3 Knowledge & Intelligence scope.

## Acceptance review

- Domain contracts and application services keep Content, Source, Topic, Relation, Extraction, Memory, Decision, and Action state in Domain Core.
- Permission and approval paths are covered for extraction persistence, memory admission/forget, decision approval, and action execution. Denials remain visible and do not write canonical state.
- Durable knowledge and memory records retain source provenance/evidence. Search remains derived state, exposes `READY`/`STALE`/`UNAVAILABLE`, and can rebuild without changing canonical content.
- Knowledge IPC validates the trusted sender and returns a typed workspace snapshot through the narrow Preload API. Renderer code has no direct Node, SQLite, filesystem, or platform-package imports.
- Lawful-data review found no bundled unclear-license corpus or unrestricted connector in the Stage 3 slice; the repository license gate passed.

## Validation evidence

| Gate                                           | Result                                 |
| ---------------------------------------------- | -------------------------------------- |
| Focused Stage 3 domain/security/recovery tests | 14 files, 35 tests passed              |
| `npm run typecheck`                            | passed                                 |
| `npm run lint -- --quiet`                      | passed                                 |
| `npm run format:check`                         | passed                                 |
| `npm run unit`                                 | 71 files, 184 tests passed             |
| `npm run integration`                          | 20 files, 45 tests passed              |
| `npm run security`                             | 0 high vulnerabilities                 |
| `npm run license`                              | 508 external packages reviewed; passed |
| `npm run check-boundaries`                     | passed                                 |
| `npm run check-doc-links`                      | passed                                 |
| `npm run build:desktop`                        | passed                                 |
| `npm run e2e-smoke`                            | 4 tests passed                         |
| `git diff --check`                             | passed                                 |

The acceptance run also corrected the Knowledge Renderer declaration from an untyped `Record<string, unknown>` result to an explicit view-model contract. This removed strict typecheck failures when accessing source health and visible IPC errors.

## Known risks and incomplete items

- `scripts/package-windows.mjs`, `tests/packaging/installed-app.spec.ts`, and `tests/packaging/installed-app.test.ts` contain pre-existing user changes and are outside this Stage 3 checkpoint.
- Stage 3 has no user acceptance recorded yet. Do not enable the Stage 4 route or create the `stage-3-knowledge-accepted` tag until the user explicitly accepts this candidate.
