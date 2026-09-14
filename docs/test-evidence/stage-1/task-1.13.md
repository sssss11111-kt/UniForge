# Stage 1 Task 1.13 — Agent Center Basic

## Scope

This slice adds the minimum real Agent Center vertical path: Agent run queue
and replayable event history, visible approval/failure/cancelled states,
permission-gated application service operations, typed IPC and a renderer
status surface. The Agent Event Store remains the runtime record source; the
renderer receives a projection and never writes runtime or domain state.

Voice and Backup / Recycle / Exit are outside this task.

## Implementation evidence

- `packages/platform-agent/agent-center-service.ts` gates create, control and
  approval operations and projects runs, events and pending approvals.
- `packages/platform-agent/agent-event-store.ts` remains the immutable event
  history boundary; snapshots are derived from event application.
- `packages/contracts/agent/center.ts` and `packages/contracts/ipc/*` define
  the typed DTO and IPC surface.
- `apps/desktop/src/main/ipc/register.ts` validates payloads and routes all
  mutations through `AgentCenterService`.
- `apps/desktop/src/preload/index.ts` exposes only the typed Agent Center
  methods; `renderer/index.html` and `renderer/app.js` display queue, approval,
  failure and cancellation state.
- Model and Tool Gateway policies stay on the Agent definition boundary; no
  provider or tool implementation becomes domain truth.

## Verification

Commands run from repository root:

```text
npx vitest run packages/platform-agent/agent-center-service.test.ts packages/platform-agent/run-service.test.ts tests/integration/agent-event-projection.test.ts tests/security/run-authorization.test.ts
4 files passed, 9 tests passed

npx tsc -b packages/contracts/tsconfig.json packages/platform-agent/tsconfig.json apps/desktop/tsconfig.build.json apps/desktop/tsconfig.preload.json --pretty false
passed
```

The focused tests cover event-backed queue projection, replay history,
approval visibility, failure and cancellation visibility, and denied mutation
without the required permission.
