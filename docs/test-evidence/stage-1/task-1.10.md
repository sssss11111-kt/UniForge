# Stage 1 Task 1.10 — Course Notes

## Scope

This slice adds typed Course Notes contracts for `Personal Note`, `AI Draft`,
and `Official Course Note`. Notes retain the course and `ContentEntity`
relationship, citations, and provenance. Personal notes and AI drafts require
`course:notes:write`; publishing an AI draft requests approval and visibly
records `WAITING_APPROVAL` or `FAILED` when approval is pending or denied.
Approved publication emits an official note with a displayed diff and a
canonical body reference, so the service does not duplicate canonical content.
The typed IPC and Preload surface only note snapshots, creation, and draft
publication. The Renderer shows empty, pending approval, failed, draft, and
official diff states without direct filesystem or database access.

## Verification

- `npx vitest run packages/core/application/course-notes-service.test.ts --config vitest.config.ts` — 4 tests passed.
- `npm run unit` — 37 files / 85 tests passed.
- `npx tsc -b tsconfig.json --pretty false` — passed.
- `npm run lint` — passed.
- `npm run build:desktop` — passed.
- `npm run check-boundaries` — passed.
- `npm run check-doc-links` — passed.
- `git diff --check` — passed.
- `npm run format:check` — repository gate remains blocked by two pre-existing formatting warnings in `packages/infrastructure/files/course-workspace-boundary.test.ts` and `packages/platform-tool/course-execution-tool.test.ts`; changed files were formatted.

No new dependency, credential, network domain, or protected filesystem write
scope was introduced. Obsidian remains a future storage adapter; this slice
does not claim an external Markdown write succeeded.
