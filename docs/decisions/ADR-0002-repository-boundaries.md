# ADR-0002: Repository boundaries

- Status: Accepted for Stage 0 baseline
- Date: 2026-09-05

## Decision

Keep contracts, core, infrastructure, and platform packages separate. Core packages cannot import Electron, SQLite bindings, provider SDKs, LangGraph, or MCP runtime types. Boundary scanning is a required CI gate.

## Consequences

Framework replacement remains possible and violations fail visibly during tests.

## Evidence and rollback

See `scripts/check-boundaries.mjs` and `tests/architecture/dependency-boundaries.test.ts`.
