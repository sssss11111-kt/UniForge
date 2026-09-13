# Modules 03–04 UI Acceptance Candidate

Prepared 2026-09-08.

Status: implementation and automated UI acceptance gates complete; real write/execute commands remain intentionally gated behind their Domain Command and Approval contracts.

Implemented and verified:

- English overview Snapshot through typed IPC and frozen Preload API.
- English vocabulary snapshot and read-only vocabulary/IELTS workspace surface.
- Project overview Snapshot through typed IPC and frozen Preload API.
- Project task, decision, and artifact relation rendering.
- Protected software workspace state and unavailable Project AI state.
- Guarded task action affordances for future typed commands and approvals.
- 03 and 04 navigation routes enabled; 05 and 06 remain roadmap-disabled.

Git checkpoints: `5316b72`, `e3b14b6`, `310635c`, `a75c4e9`, `556804e`, `c751714`, `711dadd`, `2099bde`, `b8a29ce`, `c59146e`, `5c92951`, `68e0410`, `b9c3dd4`, `77a5a63`.

Validation on 2026-09-08:

- `npm run format:check` passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run unit` passed: 70 files / 169 tests.
- `npm run integration` passed: 19 files / 40 tests.
- `npm run build:desktop` passed.
- `npm run e2e-smoke` passed: 4 tests.
- `npm run check-boundaries` passed.
- `npm run check-doc-links` passed.

Deferred capabilities remain visibly unavailable and are not represented as successful: vocabulary review mutations, IELTS execution, project task creation commands, workspace file/Git/test operations, and Project AI model execution. Their typed command and approval contracts remain future work.

The existing unrelated Windows packaging changes remain unstaged and are excluded from this evidence checkpoint.
