# Stage 1 Task 1.8 — Assignment modes evidence

## Scope

This slice adds the typed Assignment modes contract and a Domain Core owned
application service for `TUTORING`, `COLLABORATION` (the default UI mode), and
`TASK_EXECUTION`. Tutoring and collaboration start as running sessions with no
execution or submission capability. Task execution requires the user actor,
`assignment:execute`, and an approval boundary; denied approval is recorded as
`FAILED`, pending approval is visible as `WAITING_APPROVAL`, and an approved
request remains `UNAVAILABLE` until the separate Task 1.9 execution engine
exists. Code execution and source writing permissions are independent. The
contract permanently exposes `submit: false`: the slice never submits an
assignment or acts for the user in a school system.

The desktop main process exposes typed snapshot/start IPC and the Preload API.
The Renderer displays empty, waiting approval, failed, unavailable, and
running states without direct filesystem, database, or model access. No code
execution, Notes, Mastery, Exam, or later-stage capability is included.

## Verification

- `npx vitest run packages/core/application/assignment-service.test.ts --config vitest.config.ts` — 4 tests passed, including the initial RED run before implementation.
- `npm run unit` — 33 files / 76 tests passed.
- `npm run integration` — 8 files / 11 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed.
- `npm run build:desktop` — passed.
- `npm run e2e-smoke` — 1 Playwright test passed.
- `npm run check-boundaries` — passed.
- `npm run check-doc-links` — passed.
- `git diff --check` — passed.

No new dependency, credential, network domain, or filesystem write scope was
introduced. Task execution remains explicitly unavailable until Task 1.9.
