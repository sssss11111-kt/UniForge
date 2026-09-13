# Stage 3 Test Plan

- Contract tests for ContentEntity, SourceEvent, Topic, relations, MemoryClaim, and Decision.
- Application tests for provenance, permission, approval, conflict, forget, and rebuild behavior.
- IPC tests for typed payload validation and fail-closed unknown channels.
- Integration tests for import → proposal → approval → domain transaction → event → projection.
- Security tests for workspace canonicalization and protected-path rejection.
- Regression gates: typecheck, lint, unit, integration, desktop build, boundaries, and document links.
