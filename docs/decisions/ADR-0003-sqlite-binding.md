# ADR-0003: SQLite binding

- Status: Deferred
- Date: 2026-09-05

## Decision

Do not select or install a native SQLite binding in Task 0.1. Evaluate ABI, Windows packaging, backup, migration, and license evidence in the storage task before adoption.

## Consequences

The engineering baseline remains dependency-light; database behavior is intentionally unavailable.

## Evidence and rollback

The dependency review records this deferral. A later ADR must supersede this decision before installation.
