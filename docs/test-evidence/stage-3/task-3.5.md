# Stage 3 Task 3.5 — Derived Search and Rebuild

Implemented a permission-gated, rebuildable search projection. Search hits return canonical source entity references and index version; clearing or rebuilding the index does not delete domain content. The contract exposes `READY`, `STALE`, and `UNAVAILABLE` states, compares indexed source versions with canonical versions, and surfaces rebuild failures instead of returning a misleading empty success. Duplicate document/source entities are rejected and rebuild input is copied so canonical content is never mutated.

Validation: focused tests, typecheck, lint, unit/integration regression, desktop build, boundaries, documentation links, and `git diff --check`.
