# Stage 1 Task 1.7 — Course AI evidence

## Scope

This slice adds a typed Course AI proposal contract and application service.
Course AI collects traceable evidence, requests an approval before model use,
and calls the provider-neutral Model Gateway only after the request is
authorized. Model output is retained as a proposal with source categories and
never writes Course domain objects directly. Missing approval and provider
failures remain visible as `WAITING_APPROVAL` and `FAILED`; no success is
fabricated. Credentials are represented only by the gateway boundary and are
not accepted from renderer input or persisted in proposals.

The desktop boundary exposes typed Course AI snapshot/ask methods through IPC
and Preload. The renderer shows empty, running, waiting approval, completed,
and failed states. The default desktop wiring reports an unavailable model
provider honestly until a configured gateway is supplied. Assignment modes
and task execution are outside this slice.

## Verification

- `npx vitest run packages/core/application/course-ai-service.test.ts --config vitest.config.ts` — 4 tests passed.
- `npx vitest run packages/core/application/course-ai-service.test.ts packages/core/application/course-recognition-service.test.ts --config vitest.config.ts` — 8 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run format:check` — passed.
- `npm run build:desktop` — passed.
- `git diff --check` — passed.

The broader integration, security, packaging, and E2E gates remain parent
Stage 1 checkpoint gates.
