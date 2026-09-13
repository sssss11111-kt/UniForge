# Stage 4 Permission Matrix

| Operation | Permission | Approval | Notes |
|---|---|---|---|
| Read authorized news sources | `news:read` | No | Source scope enforced |
| Import/normalize source event | `news:write` | No | Provenance required |
| Propose claim extraction | `news:propose` | No | AI label and citations required |
| Persist verified claim | `news:write` | Yes | Conflicting evidence remains visible |
| Record correction | `news:write` | Yes | Preserve prior claim history |
| Create action proposal | `news:propose` | No | Evidence-linked |
| Execute external action | `external:send` | Yes | Destination and payload visible |
