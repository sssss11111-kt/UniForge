# Stage 2 Task 2.4 — FSRS Engine

Date: 2026-09-06
Status: Implemented; focused evidence captured

The application service wraps `ts-fsrs@5.4.2` behind `FsrsAdapter` / `TsFsrsAdapter`, keeping provider card and enum types out of domain contracts. Scheduling maps the four review ratings to deterministic, fuzz-free FSRS results and returns a next timestamp and interval. Priority projection combines due time, exam date/relevance, error dimension, daily load, availability, lapses, and recent performance into `MUST_REVIEW`, `SUGGESTED`, or `CAN_DEFER` with explainable reasons. Inputs are cloned before scheduling/projection so derived scheduling cannot mutate vocabulary state.

## Verification

| Command                                                                                   | Result                                                     |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `npx vitest run packages/core/application/fsrs-service.test.ts --config vitest.config.ts` | PASS — 4 tests                                             |
| `npm run typecheck`                                                                       | PASS — TypeScript project build completed with exit code 0 |

The focused tests cover deterministic adapter scheduling, priority projections, urgency signals, defensive copying, and invalid boundary inputs. Full repository lint and regression gates remain part of the parent Stage 2 checkpoint.

## Dependency review

`ts-fsrs@5.4.2` is an exact runtime dependency of `@uniforge/core`, recorded in `package.json` and `package-lock.json`. It is MIT licensed, pure TypeScript/JavaScript, and isolated behind the application adapter. No vocabulary corpus, model asset, credential, or external content is bundled.
