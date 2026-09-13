# Stage 5 Project Practice Specification

Stage 5 supports user software projects under `04 项目实践 → 软件项目`. Agents may operate only on an explicitly authorized project workspace. UniForge source, installation, updater, migrations, permission kernel, and build/signing infrastructure remain protected.

## Boundaries

- Project history remains Git truth; UniForge stores task, artifact, decision, and evidence references.
- Every project operation declares workspace, capability, risk, and approval policy.
- Source modification, deletion, external transmission, `git push`, and meaningful cost expansion require explicit permission/approval.
- Renderer uses typed Preload APIs; arbitrary shell/fs access is forbidden.
- Failed builds, tests, tools, and Agent runs remain visible and are never reported as success.
