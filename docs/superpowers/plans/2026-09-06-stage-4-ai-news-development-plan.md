# Stage 4 AI News Development Plan

## Task order

1. **Task 4.1 Source Intake and NewsEvent Domain** — canonical source events, normalized news records, provenance and deduplication.
2. **Task 4.2 Claim Extraction** — citation-bearing claims, AI Generated labels, approval-gated persistence.
3. **Task 4.3 Verification and Corrections** — cross-source status, conflicting evidence, correction history.
4. **Task 4.4 News Workspace** — typed IPC, Preload, Renderer vertical slice, saved views and visible evidence.
5. **Task 4.5 Action Proposals** — evidence-linked actions, external-send approval, failure visibility.
6. **Task 4.6 Lawful News Data Boundary** — connector/license review and automated forbidden-bundle checks.
7. **Task 4.7 Stage Acceptance** — full gates, security/license review, evidence, and user acceptance.

Each task requires contracts, focused tests, evidence, checkpoint commit, and rollback notes. Do not start the next task until the current task is verified and its subtask is closed.

Stage acceptance requires all task evidence and explicit user acceptance before creating `stage-4-ai-news-accepted`.
