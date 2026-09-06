# Stage 5 Test Plan

- Contract tests for Project, ProjectWorkspace, ProjectTask, Artifact, Decision, and evidence.
- Application tests for canonical path authorization, capability scopes, approval, failure visibility, and Git references.
- Integration tests for goal → task → authorized operation → build/test evidence → artifact → decision → retrospective.
- Security tests proving UniForge protected paths and unrelated workspaces are rejected.
- Regression gates: typecheck, lint, unit, integration, desktop build, boundaries, document links, and audit.
