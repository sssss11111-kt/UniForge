# Stage 1 Task 1.5 — Course Material Import evidence

## Scope

This slice adds a typed `CourseMaterial` contract and an application service
that imports a user-selected file through an injected managed-copy port. The
desktop main process owns the native file chooser and copies bytes into the
workspace `managed` directory under a content hash. The material retains the
original file reference, managed copy path, hash, detected file type, parser
version, extraction ranges, citations, and import timestamp. The first slice
does not parse documents or write syllabus, assessment, or Course AI objects.

The renderer receives only the typed Preload method
`course.materials.chooseAndImport`; it has no filesystem, Node, or SQLite
access. The service requires `course:write`, and the infrastructure copy
operation rejects non-files and validates the managed destination against the
workspace protected-path policy.

## Verification

- `npx vitest run packages/core/application/course-material-service.test.ts packages/infrastructure/files/managed-copy.test.ts --config vitest.config.ts` — 2 files / 5 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed.
- `git diff --check` — passed.
- `npm run unit` — 30 files / 64 tests passed.
- `npm run integration` — 8 files / 11 tests passed.
- `npm run build:desktop` — passed.
- `npm run e2e-smoke` — 1 Playwright test passed.
- `npm run check-doc-links` — passed.
- `npm run check-boundaries` — passed.
