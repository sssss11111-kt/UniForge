# ADR-0004: Credential storage

- Status: Accepted for Stage 0 baseline
- Date: 2026-09-05

## Decision

Secrets belong in operating-system secure credential storage. They must not appear in ordinary configuration, SQLite domain tables, logs, fixtures, backups, or Git.

## Consequences

Credential APIs will be introduced behind infrastructure ports and permission checks in a later task.

## Evidence and rollback

No secret storage implementation is included in Task 0.1; the rule is enforced by governance and review.
