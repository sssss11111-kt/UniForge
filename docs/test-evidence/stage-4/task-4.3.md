# Stage 4 Task 4.3 — Verification and Corrections

Implemented cross-source verification, visible conflicting evidence, append-only correction history, and immutable prior claim versions. Verification and correction writes require `news:write` plus an approval id for canonical state changes; reads require `news:read`. Stale or duplicate corrections fail closed, while pending/denied correction attempts remain visible without entering canonical history.

Validation: focused tests, typecheck, lint, unit regression, boundaries, and `git diff --check`.
