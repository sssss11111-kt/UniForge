# ADR-0005: Agent runtime boundary

- Status: Accepted for Stage 0 baseline
- Date: 2026-09-05

## Decision

Agent and LangGraph runtime state is execution state only. Agents call model and tool gateways and never write domain tables directly.

## Consequences

Domain truth remains in the Domain Core and database transaction path. LangGraph adoption is optional and deferred.

## Evidence and rollback

The package dependency direction and boundary scanner provide the baseline guard; runtime implementation is deferred.
