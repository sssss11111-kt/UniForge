# Stage 2 Task 2.5 — Adaptive Training

Date: 2026-09-06
Status: Implemented; focused evidence captured

`AdaptiveTrainingService` derives a targeted exercise from the weakest learning dimension. The mapping is explicit (for example, `MEANING` selects `meaning recognition`, `LISTENING` selects `listening discrimination`, and `COLLOCATION` selects `contextual collocation`). Every proposal is labeled `AI Generated` and retains its rationale and source vocabulary entry. A proposal is kept in `WAITING_APPROVAL` until the approval boundary allows publication; denied proposals remain visible and are never marked durable. The service validates the typed training permission and does not write domain state directly.

## Verification

| Command                                                                                                | Result                                                     |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `npx vitest run packages/core/application/adaptive-training-service.test.ts --config vitest.config.ts` | PASS — 3 tests                                             |
| `npm run typecheck`                                                                                    | PASS — TypeScript project build completed with exit code 0 |

The focused tests cover weakest-dimension selection, exercise mapping, visible AI labeling, pending and denied approval states, durable publication gating, defensive snapshots, and permission/input rejection.
