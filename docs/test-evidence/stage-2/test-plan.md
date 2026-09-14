# Stage 2 Test Plan

Date: 2026-09-06
Status: Draft pending review

## Required gates for every task

- `npm run typecheck`
- `npm run lint`
- `npm run unit`
- `npm run integration`
- `npm run build:desktop`
- `npm run check-boundaries`
- `npm run check-doc-links`
- `git diff --check`

## Focused coverage

- Exam rule isolation and supported exam types.
- Shared vocabulary identity across multiple exams.
- Independent learning dimensions and partial error updates.
- FSRS scheduling reproducibility and derived-state rebuild.
- AI Generated labels, provenance, approval, and failure visibility.
- IELTS workspace navigation without bundled restricted content.
- Mock result storage and score disclaimer.
- Renderer/Preload boundary and credential non-disclosure.

Each task must add focused tests and an evidence file under `docs/test-evidence/stage-2/` before its checkpoint commit.
