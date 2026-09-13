# Stage 1 Task 1.6 — Syllabus / Timetable / Deadline Recognition evidence

## Scope

This slice defines a controlled `CourseRecognitionProposal` contract for
syllabus, schedule, assignment, and exam recognition results. Each proposal
retains the source material reference, evidence locator and label, confidence,
candidate kind, and review status. The application service stores proposals as
`PENDING_CONFIRMATION` and performs no formal Course write at proposal time.

Formal module/assessment writes run only after a user confirmation context with
`course:write`; the write is delegated to `CourseService`, which remains the
Domain Core owner. No OCR, model provider, parser, or direct model-to-database
path is included. The desktop IPC and Preload expose typed recognition
snapshot/confirmation methods, while the renderer shows an honest empty or
pending-review state.

## Verification

- `npx vitest run packages/core/application/course-recognition-service.test.ts --config vitest.config.ts` — 1 file / 4 tests passed.
- `npx vitest run packages/core/application/course-recognition-service.test.ts packages/core/application/course-service.test.ts --config vitest.config.ts` — 2 files / 6 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed after formatting.
- `git diff --check` — passed.

The broader unit, integration, desktop build, and E2E gates are run for the
parent Stage 1 integration checkpoint.
