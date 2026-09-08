# Stage 4 AI News — Acceptance Candidate

Prepared 2026-09-09 from a fresh working-tree validation run. Tasks 4.1–4.6 are implemented with task-level evidence:

- Source Intake and NewsEvent Domain
- Claim Extraction
- Verification and Corrections
- News Workspace typed IPC
- Action Proposals
- Lawful News Data Boundary

Acceptance review:

- NewsEvents, claims, verification, corrections, and actions retain source evidence/provenance.
- Conflicting evidence remains visible; corrections are append-only history.
- External actions require `external:send` and retain visible failure state.
- Renderer access is limited to typed Preload APIs.
- No restricted news archives are bundled; automated boundary checks are present.
- The 06 AI 新闻 route is enabled because the real News snapshot, typed IPC, Preload, and Renderer adapter are present. The 05 Knowledge route remains a roadmap route.

Fresh validation evidence:

- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm run unit` — 71 files / 194 tests passed
- `npm run integration` — 21 files / 47 tests passed
- `npm run security` — passed; 0 high vulnerabilities
- `npm run license` — passed; 508 external packages reviewed
- `npm run format:check` — passed after formatting 7 previously nonconforming files
- `npm run news-boundary`
- `npm run build:desktop`
- `npm run check-boundaries`
- `npm run check-doc-links`
- `npm run check-baseline`
- `npm run e2e-smoke` — 4 tests passed
- `git diff --check`

The first E2E attempt exposed two stale assertions that expected the now-implemented 06 AI 新闻 route to remain disabled. The assertions and their integration contract were updated to match the approved Stage 4 route contract, then the complete E2E suite passed. The unrelated pre-existing changes in `scripts/package-windows.mjs`, `tests/packaging/installed-app.spec.ts`, and `tests/packaging/installed-app.test.ts` were not touched.

The `stage-4-ai-news-accepted` tag (and the equivalent `stage-4-news-accepted` tag) remains pending explicit user acceptance.
