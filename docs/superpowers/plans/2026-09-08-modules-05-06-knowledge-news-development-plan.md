# Modules 05–06 Knowledge & AI News Development Plan

**Date:** 2026-09-08  
**Owner:** Tong <17512401625@163.com>  
**Scope:** Module 05 Knowledge & Intelligence and Module 06 AI News UI/domain vertical slices.

## Governing rules

- Follow `AGENTS.md`, the V2.1 architecture specification, Stage 3/4 specifications, and the UI V2 design specification.
- Domain Core and SQLite remain business truth. Renderer, Agent, connector, model, search index, and cache never become truth.
- Every write follows typed proposal/command → permission → approval when required → Application Service → transaction → event → snapshot.
- Provenance is mandatory for imported content, claims, memory, news events, corrections, and actions.
- No `07 开发区`; no unrestricted scraping, arbitrary filesystem, connector secrets, or unclear-license bundled corpus.
- Enable 05/06 navigation only after a real snapshot, typed IPC, visible error/offline/permission states, and focused tests exist.
- Do not add production dependencies without `docs/governance/third-party-registry.md` review.

## Shared ownership and paths

- Contracts: `packages/contracts/knowledge/*`, `packages/contracts/news/*`, `packages/contracts/ipc/api.ts`, `packages/contracts/ipc/dto.ts`
- Domain/application services: `packages/core/domain/*`, `packages/core/application/*`
- IPC: `apps/desktop/src/main/ipc/register.ts`
- Preload: `apps/desktop/src/preload/index.ts`
- Renderer: `apps/desktop/src/renderer/modules/knowledge.js`, `knowledge.d.ts`, `knowledge.css`, `news.js`, `news.d.ts`, `news.css`, `app.js`, `app.css`
- Tests: `packages/core/**/*.test.ts`, `tests/integration/knowledge-*.test.ts`, `tests/integration/news-*.test.ts`, `apps/desktop/tests/knowledge.spec.ts`, `apps/desktop/tests/news.spec.ts`
- Evidence: `docs/test-evidence/stage-3/`, `docs/test-evidence/stage-4/`

## Task order

### Task 5.1 — Content and Source Inbox domain

Create `packages/contracts/knowledge/content.ts`, `source.ts`, and `provenance.ts`; implement canonical `ContentEntity` and `SourceEvent` application services. Import copies into an authorized managed workspace and records source, capture time, license, checksum, and lifecycle. Add permission and provenance tests. No renderer yet.

Validation: focused core tests, typecheck, lint. Checkpoint: `feat(knowledge): add content and source contracts`.

### Task 5.2 — Topics and relations

Create typed Topic/Relation contracts and services. Distinguish remove relation, delete, archive, and forget. Add relation authorization and cross-object reference tests without duplicating canonical bodies.

Validation: focused tests, boundary scan. Checkpoint: `feat(knowledge): add topic relation domain`.

### Task 5.3 — Extraction proposals and approval

Add citation-bearing extraction proposal contracts, AI-generated labels, confidence/evidence references, and approval-gated persistence. Denied approval must remain visible and must not write domain truth.

Validation: proposal lifecycle tests, permission tests, failure tests. Checkpoint: `feat(knowledge): add cited extraction proposals`.

### Task 5.4 — Memory admission

Implement Receipt → Evidence → Candidate → conflict/scope/authorization → Claim → Outcome. Every claim keeps provenance; forgetting invalidates dependent derived state. Add conflict and forget tests.

Validation: focused memory tests, provenance audit. Checkpoint: `feat(knowledge): add provenance memory admission`.

### Task 5.5 — Derived search and rebuild

Create rebuildable search/index contracts under `packages/core/application/knowledge-search-service.ts`. Mark stale/unavailable indexes explicitly and support rebuild without changing canonical content. Add stale-index and rebuild tests.

Validation: focused tests and boundary checks. Checkpoint: `feat(knowledge): add rebuildable knowledge search`.

### Task 5.6 — Decisions and actions

Add evidence-linked decision/action proposals. External transmission, destructive actions, and project changes require explicit permission and approval. Preserve failures and cancellation records.

Validation: command/approval tests. Checkpoint: `feat(knowledge): add evidence-linked actions`.

### Task 5.7 — Knowledge IPC and workspace

Add `knowledgeWorkspaceSnapshot`, inbox/topic/memory/action DTOs and handlers to `packages/contracts/ipc/*`, `apps/desktop/src/main/ipc/register.ts`, and `apps/desktop/src/preload/index.ts`. Implement `loadKnowledgeWorkspace` and `renderKnowledgeWorkspace` with inbox filters, selected content, provenance, source health, empty/error/offline/read-only/approval states. Enable route 05 only after tests pass.

Validation: integration contracts, renderer adapter tests, Electron E2E and visual check. Checkpoint: `feat(ui): add knowledge workspace vertical slice`.

### Task 5.8 — Stage 3 acceptance

Run lawful-data, security, provenance, format, lint, typecheck, unit, integration, boundary, doc-link, build, and E2E gates. Update all `docs/test-evidence/stage-3/task-*.md`, add acceptance candidate, and request explicit user acceptance before any Stage 4 route enablement.

### Task 6.1 — Source intake and NewsEvent domain

Create `packages/contracts/news/source.ts`, `event.ts`, `provenance.ts`; normalize connector proposals into canonical NewsEvent records with capture/publish/update times, source quality, deduplication keys, and visible fetch failures.

Validation: source/event/provenance tests and connector permission tests. Checkpoint: `feat(news): add normalized news events`.

### Task 6.2 — Claim extraction

Add citation-linked claim contracts, AI-generated labels, confidence, and approval-gated persistence. Claims without evidence remain visibly unverified.

Validation: claim lifecycle tests. Checkpoint: `feat(news): add cited claim extraction`.

### Task 6.3 — Verification and corrections

Implement cross-source verification, conflicting claim presentation, correction history, and immutable prior versions. Never silently choose a winner.

Validation: conflict/correction tests. Checkpoint: `feat(news): add verification and corrections`.

### Task 6.4 — News IPC and workspace

Add typed News workspace snapshot, saved views, source filters, grouped Today AI sections, detail claims/corrections/evidence, and visible loading/empty/error/offline/read-only states. Update `apps/desktop/src/renderer/modules/news.js`, `news.d.ts`, `news.css`, IPC, Preload, and E2E tests. Enable route 06 only after real snapshot and typed IPC exist.

Validation: integration, Electron E2E, visual verification. Checkpoint: `feat(ui): add ai news workspace vertical slice`.

### Task 6.5 — Action proposals

Add News → task/knowledge/project/reading-item proposal commands. External send and execution require approval; failures and rejected actions remain visible.

Validation: command, permission, approval, cancellation tests. Checkpoint: `feat(news): add evidence-linked news actions`.

### Task 6.6 — Lawful data boundary

Review every connector and dataset in `docs/governance/third-party-registry.md`; add forbidden-bundle checks for paywalled/private/unclear-license corpora and secret leakage. No production connector is enabled without scope and license evidence.

Validation: license/security checks. Checkpoint: `chore(news): enforce lawful data boundary`.

### Task 6.7 — Stage 4 acceptance

Run full gates, security/license review, boundary and documentation checks, build, and E2E. Update `docs/test-evidence/stage-4/`, create acceptance candidate, and request explicit user acceptance before closing Stage 4.

## Per-task completion protocol

For every task: define failing focused test, implement smallest vertical slice, run focused and related regression tests, review permissions/provenance/failure behavior, save evidence, commit a checkpoint, and record rollback notes. Close the subtask before starting the next one.

## Acceptance criteria

- 05 and 06 are enabled only through real snapshots and typed IPC.
- Every durable content, memory, claim, event, correction, and action retains provenance.
- Derived indexes are rebuildable and never canonical truth.
- Conflicts, failures, offline state, denied permission, and approval requirements remain visible.
- No unrestricted scraping, secret exposure, unclear-license corpus, or protected-path bypass exists.
- Full repository gates and stage evidence pass; explicit user acceptance is recorded.
