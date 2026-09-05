# Task 0.12 — LangGraph Adapter PoC

Status: boundary PoC checkpoint; live LangGraph execution is blocked pending dependency and license approval.

Implemented the replaceable `platform-agent/langgraph` boundary. `LangGraphAdapter` delegates run metadata and AgentEvent transitions to `RunService`; runtime checkpoints carry only adapter version, cursor, state, and SHA-256 checksum. The optional graph is injected through `FoundationGraph`, so LangGraph types and state cannot become Domain Core truth. Cancellation and approval-before-write behavior are covered by focused tests.

Verification:

- `npm run unit -- packages/platform-agent/langgraph/adapter.test.ts tests/integration/langgraph-approval.test.ts tests/recovery/langgraph-crash.test.ts tests/security/langgraph-boundary.test.ts` — 4 files, 5 tests passed.
- `npm run typecheck` — passed.
- `scripts/poc-langgraph.mjs` intentionally exits 2 until the optional dependency/license decision is approved; no live runtime success is claimed.

Scope boundary: no Knowledge/Memory/FTS5 work from Task 0.13 is included.
