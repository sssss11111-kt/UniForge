# Stage 2 Task 2.8 — Lawful English Data Boundary

Added the canonical data-boundary policy and an automated engineering test that rejects restricted or unclear-license dataset names under `packages/`. The test allows typed IELTS and mock-exam contracts while preventing bundled exam corpora and answer keys.

Validation: focused test, full unit/integration regression, typecheck, lint, desktop build, boundary scan, documentation link check, and `git diff --check`.
