# Stage 4 AI News Specification

Stage 4 provides a provenance-first AI News workspace: multi-source intake, normalization, deduplication, claim extraction, cross-source verification, correction history, and evidence-linked actions. News events and source records remain Domain Core truth; summaries, rankings, feeds, and search indexes are derived state.

## Boundaries

- Connectors only propose typed source events; they never write news truth directly.
- Every claim retains source references, capture time, and verification status.
- Conflicting claims remain visible with their evidence; the system must not silently select a winner.
- External transmission and action execution require explicit permission and approval.
- No paywalled, private, or unclear-license article corpus is bundled.
- Renderer uses typed Preload APIs only; secrets remain in OS secure storage.

## Vertical slices

1. Source intake and normalized NewsEvent.
2. Claim extraction with citations and AI Generated labeling.
3. Cross-source verification and correction history.
4. News workspace, saved views, and action proposals.
