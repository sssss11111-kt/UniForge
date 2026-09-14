# Stage 3 Knowledge & Intelligence Specification

## Scope

Stage 3 turns authorized information into provenance-bearing knowledge and actions. Domain Core remains the source of truth for `ContentEntity`, `SourceEvent`, `Topic`, relations, `MemoryClaim`, and `Decision`. Search, embeddings, summaries, and runtime checkpoints are derived state.

## Boundaries

- Imported content is copied into an authorized managed workspace and retains source provenance.
- Agents propose typed commands; they never write domain tables directly.
- Durable memory requires receipt, evidence, candidate, conflict/scope checks, authorization, and an explicit outcome.
- External transmission, durable memory admission, destructive deletion, and project writes require the existing Permission/Approval path.
- Renderer uses typed Preload APIs only.
- No unrestricted web scraping, connector secrets, or unlicensed corpora are bundled.

## Initial vertical slices

1. Source Inbox and canonical `ContentEntity` import.
2. Topic and relation management with remove-relation versus delete semantics.
3. Knowledge extraction proposal with citations and approval.
4. Memory admission flow with provenance and conflict outcomes.
5. Action/decision proposal linked to source and knowledge evidence.

## Acceptance invariants

Every durable claim has provenance; every derived index can be rebuilt; denied permissions fail visibly; no Agent, model, connector, or index becomes business truth.
