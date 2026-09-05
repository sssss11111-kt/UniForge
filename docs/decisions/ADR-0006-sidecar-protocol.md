# ADR-0006: Sidecar protocol

- Status: Accepted for Stage 0 baseline
- Date: 2026-09-05

## Decision

Heavy capabilities such as OCR, speech, and document parsing will run behind independently startable, health-checkable, cancellable, versioned sidecar contracts. No sidecar binary is bundled in Task 0.1.

## Consequences

Sidecar failures can be isolated from the desktop process and remain visible in run records.

## Evidence and rollback

The `@uniforge/platform-sidecar` package is a contract placeholder only; protocol implementation is deferred to the sidecar task.
