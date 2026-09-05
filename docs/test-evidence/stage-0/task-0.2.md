# Task 0.2 — Domain Contracts evidence

Date: 2026-09-05  
Branch: `codex/stage-0-foundation`  
Scope: cross-domain Contract V1 candidate and pure Task transition only.

## Implemented

- Portable primitives use branded `Id`, `Instant`, `Json`, and unified `FailureCode`/`Result` values; parsing validates canonical IDs and millisecond UTC timestamps and carries `correlationId` on failures.
- Contracts define Task/Workspace entities, typed commands/events, permission grants and approvals, and evidence-backed memory candidate/claim types.
- Core exposes the unified Result, optimistic-version `completeTask`, workspace ownership helper, transaction-scoped repository/event/receipt ports, and a typed `DomainCommandBus.execute(command, context)`.
- Entities include Workspace, Task, Artifact, Approval/AgentRun references, and minimal cross-stage reference types.
- Domain packages have no Electron, SQLite binding, provider SDK, LangGraph, or MCP dependency.

## Test evidence

Initial focused command (before implementation):

`npm run unit -- packages/core/domain/task.test.ts packages/contracts/domain/serialization.test.ts` → exit `1`; both suites failed because the requested modules did not exist.

After implementation:

- `npm run unit -- packages/core/domain/task.test.ts packages/contracts/domain/serialization.test.ts` → exit `0`, 2 files / 6 tests passed.
- `npm run typecheck` → exit `0`.
- `npm run lint` → exit `0`.
- `npm run format:check` → exit `0`.
- `npm run check-boundaries` → exit `0`.

## Known limits

This is a Contract V1 candidate, pending Stage 0 acceptance. SQLite schema/migrations, event persistence, real permission enforcement, IPC, and command handlers are intentionally deferred to subsequent tasks. Cross-stage reference types intentionally freeze only identity, ownership/version/time, and essential relation fields.

## Rollback

Revert the Task 0.2 checkpoint commit after verifying the worktree and preserving evidence. No database downgrade is involved.
