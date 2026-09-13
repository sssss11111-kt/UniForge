# Stage 5 Permission Matrix

| Operation | Permission | Approval | Boundary |
|---|---|---|---|
| Read authorized project workspace | `project:read` | No | Canonical path required |
| Modify project source | `project:write` | Yes | Explicit workspace only |
| Run build/test | `project:execute` | Yes | Workspace-scoped process |
| Delete project files | `project:delete` | Yes | Destructive and visible |
| Commit locally | `git:commit` | Yes | Project repository only |
| Push remotely | `git:push` | Yes | Destination visible |
| Send artifact externally | `external:send` | Yes | Payload and destination visible |
