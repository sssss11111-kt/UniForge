# Task 0.10 — AgentRuntime Contract / Event Lifecycle

## Scope

Implemented the framework-neutral ten-method `AgentRuntime` contract and a RunService reference implementation. `AgentEvent` is the immutable execution history; snapshots are rebuilt by `reduceAgentEvents` and are updated only alongside accepted events. Adapter checkpoints remain runtime payloads and are not domain records.

## Automated validation

| Check | Command | Result |
|---|---|---|
| Focused lifecycle, projection, authorization, recovery tests | `npm run unit -- packages/platform-agent/run-service.test.ts tests/integration/agent-event-projection.test.ts tests/security/run-authorization.test.ts tests/recovery/run-lifecycle.test.ts` | PASS — 4 files, 7 tests |
| Workspace type check | `npm run typecheck` | PASS |

## Acceptance coverage

- Illegal lifecycle transitions and terminal immutability are rejected; cancellation is idempotent.
- Approval waiting is explicit and `resume` returns `APPROVAL_REQUIRED` until approval resolution.
- Event sequence conflicts and duplicate event IDs are rejected; history remains available if a snapshot is absent.
- Stream supports `afterSeq` pagination; inspect and mutations deny a different workspace.
- Fork creates a new run from the definition and does not copy runtime grants (grants are not part of the contract).
- Registry accepts only adapters implementing all ten methods and rejects duplicate names.

## Evidence metadata

- Date: 2026-09-05 (Asia/Shanghai)
- Platform: Windows, PowerShell, Node/npm workspace
- Commit: final Git checkpoint with message `feat: define agent runtime contract` (recorded by repository history)
- External/live runtime integration: BLOCKED by scope; Task 0.12 owns the LangGraph adapter.

## Rollback

Revert the Task 0.10 commit. Runtime registry can be disabled independently; immutable event history and retry evidence must be retained. An adapter unable to read its checkpoint must report `UNAVAILABLE` rather than mutating a failed run to success.
