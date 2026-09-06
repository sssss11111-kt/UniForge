# Stage 4 Task 4.1 — Source Intake and NewsEvent Domain

Implemented provenance-bearing source intake and normalized NewsEvent records. Duplicate content hashes merge source references into one canonical event; source events and canonical news records remain separate domain objects. Invalid URLs and missing permissions fail closed.

Validation: focused tests, typecheck, lint, unit/integration regression, desktop build, boundaries, documentation links, and `git diff --check`.
