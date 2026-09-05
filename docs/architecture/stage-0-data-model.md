# Stage 0 Data Model

确切Schema基线见实施计划D；本文件记录所有权/恢复约束，避免与migration维护第二套DDL。

- Domain Core/SQLite：workspaces/tasks/approvals/permissions/artifacts，业务改变+domain_events+command_receipts同事务。
- Agent历史：agent_events；agent_runs是同事务快照，可从事件重建。
- Managed文件正文：managed copy，managed_files只元数据；原文件删除不丢副本。
- Git历史：Git；Obsidian正式正文：Vault Markdown。关系/索引不是第二正文。
- Personal Core：隔离私有PoC库；对话不自动进入Memory。
- projection_offsets/FTS/cache为可重建派生数据。
- tool_invocations保存副作用receipt，UNKNOWN不盲重试。
- runtime checkpoint不属于Domain真源，但缺失不保证精确恢复，不作为普通缓存清理。

普通备份字段/实体allowlist，包含授权Managed Copy数据及哈希，排除密钥、登录/Cookie/Git凭据、原始音频、原始聊天、Personal Core。私有Memory备份必须支持Forget失效和恢复防复活。恢复先临时区验证再切换。

Migration单向版本化、checksum、预备份、失败封锁写入；代码revert不等于数据降级。Stage0不建完整课程/英语/项目/新闻业务表。最终PoC→产品Memory Schema仍经后续阶段审查。
