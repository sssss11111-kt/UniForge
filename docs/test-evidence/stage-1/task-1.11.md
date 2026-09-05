# Stage 1 Task 1.11 — Mastery and Wrong Problems

## Scope

This slice adds Domain Core owned Mastery Evidence and Wrong Problem contracts
and an application service. Mastery is derived from normalized evidence for
recent practice, accuracy, hints, forgetting, self assessment, or mock
results, with source references and provenance retained. Wrong Problems can be
course scoped or unscoped, reference the canonical problem/content identifier,
and never copy the canonical body. A user can correct an AI classification;
the correction is visible as a state change and remains traceable.

Typed IPC and Preload expose snapshot, evidence recording, wrong problem
recording, and user correction. The Renderer represents empty, ready, and
failed states. This task does not add Exam, Review Plan, Agent Center, Voice,
Backup, model behavior, or search/index truth.

## Verification

- `npx vitest run packages/core/application/course-mastery-service.test.ts --config vitest.config.ts` — 4 tests passed.
- `npx tsc -b tsconfig.json --pretty false` — passed.

No new dependency, credential, network, or filesystem write scope was
introduced. Domain state remains owned by the application service; evidence
and wrong problems retain provenance and canonical references.
