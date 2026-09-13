# Stage 1 Task 1.4 — Course Domain evidence

## Scope

This slice adds the typed Course/Term/Module/Assessment contract, an in-memory
application service, typed IPC read/create entry points, and a renderer course
entry page. Course creation requires the `course:write` permission and is
performed by the service; the renderer has no direct filesystem, database, or
Node access.

It deliberately does not implement material import, OCR, syllabus extraction,
Course AI, or external integrations. The empty course snapshot is an honest
state, not seeded demo data.

## Verification

- `npm run typecheck` — passed.
- `npx vitest run packages/core/application/course-service.test.ts --config vitest.config.ts` — 2 tests passed.
- `npm run lint` — passed.
- `npm run format:check` — passed after formatting the changed files.
- `git diff --check` — passed.

- `npm run unit` — 29 files / 61 tests passed.
- `npm run integration` — 8 files / 11 tests passed.
- `npm run build:desktop` — passed.
- `npm run e2e-smoke` — 1 Playwright test passed.
