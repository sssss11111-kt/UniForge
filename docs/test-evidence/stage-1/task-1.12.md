# Stage 1 Task 1.12 — Exam / Review Plan

## Scope

This slice adds the Course Domain contracts for an `Exam` and its associated
`ReviewPlan`. A plan retains the course relationship, exam date and scope,
mastery evidence provenance, available daily study time, and the user goal.
Plans require `course:review-plan:write` and pass through the shared approval
boundary. A pending approval remains `WAITING_APPROVAL`; a denied approval is
`FAILED`; only an approved request receives scheduled sessions. No model or
Agent claims to generate a plan, and no exam attempt or result is implemented.

The typed Electron IPC and Preload surface exposes a snapshot and create
operation. The renderer reports empty, waiting approval, failed, and ready
states. The renderer receives no Node.js, filesystem, SQLite, or domain-table
access.

## Verification

The focused test was first run before implementation and failed because the
service module did not exist. After implementation:

```text
npx vitest run packages/core/application/course-exam-review-service.test.ts --config vitest.config.ts
  PASS — 1 file / 4 tests
npm run typecheck
  PASS
npm run lint -- --quiet
  PASS
```

The tests cover empty state, provenance and mastery relationship, pending
approval, approved scheduling with low-mastery prioritisation, denied
approval, permission denial, and invalid input. The broader desktop and E2E
gates remain parent Stage 1 integration checks.

## Boundary notes

This task does not implement Agent Center, Voice, Backup, exam execution,
external calendar sync, model calls, or a second source of truth. Calendar
export remains a future low-coupling adapter.
