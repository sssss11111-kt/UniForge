# Stage 1 Task 1.3 — Dashboard

## Scope

This checkpoint adds the Dashboard vertical slice. The dashboard reads a typed
snapshot from the trusted main process and renders:

- 今日焦点；
- 快速开始；
- 课程与考试；
- Agent 与审批；
- 最近空间。

Course and Agent domain objects are not created by this task. Their absence is
shown as an explicit empty state. Approval count and workspace state come from
the application service source, and AI risk guidance carries an explicit reason.
The renderer receives only the dashboard DTO through the preload bridge.

## Files

- `packages/contracts/dashboard/index.ts` — Dashboard DTO, item state, and priority contracts.
- `packages/core/application/dashboard-service.ts` — trusted state composition and honest empty/read-only states.
- `packages/core/application/dashboard-service.test.ts` — service, read-only, and approval-count tests.
- `packages/contracts/ipc/dto.ts`, `packages/contracts/ipc/api.ts` — Dashboard IPC contract.
- `apps/desktop/src/main/ipc/register.ts` — validated `dashboard-snapshot` handler.
- `apps/desktop/src/preload/index.ts` — minimal `dashboard.getSnapshot` bridge.
- `apps/desktop/src/renderer/index.html`, `app.js`, `app.css` — Dashboard presentation.
- `apps/desktop/tests/launch.spec.ts` — Electron smoke coverage.

## Verification

Commands run for this checkpoint:

```text
npm run typecheck
npm run lint
npx prettier --check packages/contracts/dashboard/index.ts packages/core/application/dashboard-service.ts packages/core/application/dashboard-service.test.ts packages/contracts/index.ts packages/contracts/ipc/dto.ts packages/contracts/ipc/api.ts apps/desktop/src/main/ipc/register.ts apps/desktop/src/preload/index.ts apps/desktop/src/renderer/index.html apps/desktop/src/renderer/app.js apps/desktop/src/renderer/app.css apps/desktop/tests/launch.spec.ts docs/test-evidence/stage-1/task-1.3.md
npm run unit -- --run packages/core/application/dashboard-service.test.ts
npm run build:desktop
npx playwright test apps/desktop/tests/launch.spec.ts --timeout=20000 --reporter=line
```

The final results are recorded with the Task 1.3 commit and must be kept with
the corresponding CI run.

## Boundary notes

This task does not implement Course Domain, Agent execution, external model
calls, or later-stage modules. It does not infer task progress, deadlines, or
recommendations without a trusted source.
