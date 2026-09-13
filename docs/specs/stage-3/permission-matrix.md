# Stage 3 Permission Matrix

| Operation | Permission | Approval | Notes |
|---|---|---|---|
| Read authorized source/content | `knowledge:read` | No | Workspace scope enforced |
| Import/copy source content | `knowledge:write` | No | Provenance required |
| Create topic/relation | `knowledge:write` | No | Typed domain command |
| Propose extraction/summary | `knowledge:propose` | No | Proposal only |
| Persist approved extraction | `knowledge:write` | Yes | Citation and provenance required |
| Admit memory claim | `memory:write` | Yes | Conflict and scope checks required |
| Forget memory claim | `memory:forget` | Yes | Invalidate derived indexes |
| External transmission | `external:send` | Yes | Destination and payload visible |
| Create action/decision proposal | `knowledge:propose` | No | Execution remains separate |
