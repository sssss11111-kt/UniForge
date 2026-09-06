# Stage 3 Task 3.5 — Derived Search and Rebuild

Implemented a permission-gated, rebuildable search index. Search hits return canonical source entity references and index version; clearing or rebuilding the index does not delete domain content. Duplicate source entities are rejected.

Validation: focused tests, typecheck, lint, unit/integration regression, desktop build, boundaries, documentation links, and `git diff --check`.
