# Stage 1 Task 1.11 — Mastery and Wrong Problems

## Scope

This vertical slice records course mastery evidence and single-problem wrong
problem records through the Domain Core service. Mastery is derived from
evidence values and retains source provenance; canonical course content is
referenced by `problemRef` rather than copied. Wrong problems may be course
scoped or optional at creation, while corrections are scoped to the active
course and record a user correction of an AI classification. Writes require
the `course:mastery:write` or `course:wrong-problems:write` permission.

The Electron IPC and typed preload expose snapshot, evidence, wrong-problem,
and correction operations. The renderer shows the empty, ready, and failed
states without direct filesystem, database, or domain-table access.

## Verification

- `npx vitest run packages/core/application/course-mastery-service.test.ts --config vitest.config.ts` — 5 tests passed.
- `npm run typecheck` — passed.

The remaining repository gates are run by the parent Stage 1 integration
checkpoint. No dependency, credential, network, or protected-path write scope
was introduced. Exam, Agent, Voice, and Backup behavior remain outside this
task.
