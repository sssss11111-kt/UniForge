# Stage 4 Test Plan

- Contract tests for source events, NewsEvent, claims, verification, corrections, saved views, and actions.
- Application tests for provenance, deduplication, conflicts, correction history, permissions, and approval.
- IPC tests for typed payload validation, sender validation, and fail-closed unknown channels.
- Integration tests for intake → normalization → extraction → verification → correction → action proposal.
- Security and license tests for connector scope, secret handling, and forbidden bundled article data.
- Regression gates: typecheck, lint, unit, integration, desktop build, boundaries, document links, and audit.
