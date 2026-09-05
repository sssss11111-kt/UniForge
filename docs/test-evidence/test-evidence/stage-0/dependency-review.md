# Stage 0.1 dependency review

Reviewed 2026-09-05 against official repositories and package metadata. The baseline uses pinned versions and permissive licenses listed in `docs/governance/third-party-registry.md`. Electron is the only runtime binary; no native SQLite binding is installed in this task, so ABI risk is deferred to Task 0.3 with a separate review.
