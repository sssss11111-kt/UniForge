# ADR-0001: Desktop runtime

- Status: Accepted for Stage 0 baseline
- Date: 2026-09-05

## Decision

Use Electron 44.2.0 with a narrow Main/Preload/Renderer boundary. The baseline window enforces `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`.

## Consequences

Renderer receives only typed APIs exposed by Preload. Product UI and business IPC are deferred to later stage gates.

## Evidence and rollback

See `apps/desktop/src/main/index.ts` and the Stage 0 smoke test. Revert the Task 0.1 commit to roll back.
