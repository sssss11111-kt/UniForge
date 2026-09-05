# Stage 0 — Architecture Foundation Implementation Plan

> **For agentic workers:** 执行时使用 superpowers:executing-plans 按任务推进；只有获得明确委派授权时才使用 superpowers:subagent-driven-development。使用 checkbox 追踪，编码前建立独立 branch/worktree。当前只准备计划，禁止执行实现步骤。

**Goal:** 在 Windows 上证明自主领域内核、权限、存储、网关和可替换运行时能安全工作，提供真实 PoC 与恢复证据，不实现产品业务。

**Architecture:** Domain Core 独占领域写入口；应用层经权限与审批协调事务、事件和文件。Electron Main 组装可信服务，Renderer 经 typed Preload IPC 访问；模型、工具、Runtime、Knowledge、Sidecar 均经自有契约隔离。

**Tech Stack:** Electron、TypeScript strict、Node.js、SQLite、Electron Forge、Vitest、Playwright。LangGraph.js、MCP SDK、OCR/Speech/Document 引擎为经核验后才接入的 PoC 候选。提议 npm workspaces + package-lock.json；这属于 Stage 0 工程决策，并非已锁定依赖版本。

**Spec:** `docs/specs/2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md`

**Master:** `docs/superpowers/plans/2026-09-05-uniforge-v2.1-complete-development-plan-with-ui.md` §10.2～10.19。

**Status:** 2026-09-05 待用户审阅；没有编码授权、测试通过证据或架构批准。冲突见 `docs/architecture/2026-09-05-source-review.md` C1～C8/G1～G5。本文所有新增 Schema、签名和默认策略都是待批准的 Stage 0 技术提案，不能覆盖上位规格。

## Global Constraints

- “Framework can change. UniForge remains.”
- “业务对象归 Domain Core，不能归 Agent。”
- “一个对象只有一个正式真源。”
- “LangGraph State ≠ UniForge Domain State”。
- “高风险操作必须确认。”保护路径硬拒绝优先，不能确认后放行。
- “失败必须真实暴露，不允许假完成。”
- Windows 优先；原规格未给版本下限/性能数值，本计划不冒充已有 SLA。
- 严格 Stage 0 → Stage 0.5 → Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5。
- 无 07 开发区、无 Stage 6、无应用内自我开发；保护源码、安装目录、更新器、Migration 实现、权限内核、构建签名逻辑。
- 当前不写业务代码、不安装未经确认的生产依赖；执行必须等“确认，开始开发 Stage 0”。
- 不生成未来业务页面；Stage 0 只允许无产品设计含义的技术验证窗口和合成 fixture。
- Core/Domain 不导入 Electron、SQL binding、Provider SDK、LangGraph 或 MCP 类型。
- Secret 仅进 OS 安全凭据系统；日志、fixture、普通备份、Git 不保存密钥/Cookie/登录/Git 凭据。
- Personal Core 不进入课程目录、Git 项目、公共 Vault、项目导出包。
- Stage 0 无真实用户项目源码修改、无 git push、无发邮件/消息、无生产发布、无正式自动更新服务器。

---

## A. 执行前门禁与初始状态

初始目录 `C:/Users/Tong/Documents/ChatGPT/New project` 仅有已初始化 `.git`，分支 master 尚无提交、无 remote。当前六份 Markdown 是规划工作，不是 Stage 0 已完成。

- [ ] 用户确认开始 Stage 0；记录 C1～C8 的逐项决定。C1/C3/C4/C5 在相关实现前必须解决，不能凭本计划替代确认。
- [ ] 原样归档的四份真源经用户认可的文本修订另作文档提交；阶段技术细节纳入 `docs/specs/2026-09-05-stage-0-architecture-foundation-spec.md`、`docs/architecture/stage-0-technical-design.md`、`docs/architecture/stage-0-data-model.md`、`docs/architecture/stage-0-permission-matrix.md`，由本计划已列提案展开并审批。没有独立认可前不称“V1 冻结”。
- [ ] 确认 Git identity；不自动修改全局 identity。首次提交仅精确暂存上述已审阅文档及本次六份 Markdown，不使用 `git add .`。
- [ ] 创建初始文档 checkpoint `docs: record uniforge v2.1 foundation planning baseline`；记录 commit SHA。空仓库不能在有首个 commit 之前建立基于 HEAD 的 worktree。
- [ ] 使用 `git worktree add -b codex/stage-0-foundation ../uniforge-stage-0 HEAD` 建独立工作副本；若路径/分支已存在先检查并选未占用目标，不删除覆盖。master 不强制改名。Master 中 stage/feat 名只是建议，采用 codex/ 前缀不改变架构。
- [ ] 执行环境确认依赖候选的官方版本、Windows 支持、安全公告及 License；写 registry 和 ADR，再安装获确认的版本。不得使用未锁定 latest 作为验收依据。

## B. 目录、package 与依赖方向

以下均是执行时拟创建，不是当前已有代码。各 package 的 manifest 名按表使用，exports 只暴露契约/公开入口。表内目录以仓库根为基准；后续任务列出确切文件。

| 路径 | package 名 | 职责 / 可依赖 |
|---|---|---|
| apps/desktop | @uniforge/desktop | Main 组合服务；Preload/Renderer 只能接 contracts 的 IPC 子集 |
| packages/contracts | @uniforge/contracts | 纯 TS 值/接口与可移植运行时校验，无 I/O |
| packages/core | @uniforge/core | Domain、Application Service、Event、Permission、Approval；仅 contracts |
| packages/infrastructure | @uniforge/infrastructure | SQLite、文件、凭据、日志、备份、固定进程；实现 core ports |
| packages/platform-model | @uniforge/platform-model | 模型协议适配及路由；contracts/core ports |
| packages/platform-tool | @uniforge/platform-tool | 工具执行边界与 MCP adapter；contracts/core ports |
| packages/platform-agent | @uniforge/platform-agent | 自有运行状态、Native、可选 LangGraph adapter；只调用网关接口 |
| packages/platform-knowledge | @uniforge/platform-knowledge | Markdown/FTS/隔离 Personal Core PoC |
| packages/platform-sidecar | @uniforge/platform-sidecar | 受控进程生命周期、协议与资源限制 |

`packages/platform-connectors` 及六个 `packages/domain-*` 仅是 Master 的后续目录，不在 Stage 0 建生产 package。MCP PoC 放 platform-tool；不提前开发微信/抖音连接器。跨阶段实体只在 contracts 声明，未来业务状态机在各阶段批准，不预造完整课程/英语/新闻 Schema。

`sidecars/ocr`、`sidecars/speech`、`sidecars/document` 是协议包装与独立锁定运行环境，不作为 Core 依赖；`sidecars/sandbox` 和 IDE 组件留到后续阶段。

## C. 统一类型与拟冻结契约

所有接口最终定义在下列确切路径，implementation 返回 Result，不把异常堆栈/密钥发给 Renderer。边界校验不得只靠 TypeScript 类型。

### C1. 共享类型

`packages/contracts/domain/primitives.ts`：

```ts
export type Id<K extends string> = string & { readonly __kind: K };
export type Instant = string & { readonly __utcIso: true };
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type FailureCode = 'INVALID_INPUT' | 'INVALID_TRANSITION' | 'DENIED'
  | 'PROTECTED_PATH' | 'EXPIRED' | 'APPROVAL_REQUIRED' | 'NOT_FOUND'
  | 'CONFLICT' | 'UNAVAILABLE' | 'TIMEOUT' | 'CANCELLED' | 'BUDGET_EXCEEDED'
  | 'CAPABILITY_MISMATCH' | 'MIGRATION_FAILED' | 'CORRUPT_BACKUP';
export type Result<T> = { ok: true; value: T } |
  { ok: false; error: { code: FailureCode; message: string; correlationId: string } };
export interface Entity<K extends string> {
  id: Id<K>; workspaceId: Id<'workspace'>; version: number;
  createdAt: Instant; updatedAt: Instant;
}
export interface EvidenceRef {
  sourceId: Id<'source'>; locator: string; contentHash: string;
  collectedAt: Instant; processorVersion?: string;
}
export interface RequestContext {
  actorId: Id<'actor'>; workspaceId: Id<'workspace'>;
  runId?: Id<'agent-run'>; correlationId: string;
}
```

`parseId(kind, value): Result<Id<K>>` 和 `parseInstant(value): Result<Instant>` 拒绝空值、非 UTC 时间和格式不合法值；生产时 Main 从会话构造 RequestContext，Renderer 不传 actorId/授权结论。

### C2. Domain / Command

`packages/contracts/domain/entities.ts`：Workspace {name,status: ACTIVE|READ_ONLY}；Task {title,status: CREATED|RUNNING|COMPLETED|CANCELLED,owner: {kind: workspace|course|project|exam-space|content|news,id}}；Artifact {kind,managedFileId,sha256,runId?}；Approval/AgentRun 采用 C3/C7 定义。

Course、ExamSpace、Project、ContentEntity、SourceEvent、Topic、VocabularyEntry、LearningEvent、NewsEvent、Workflow、MemoryClaim、Decision 以各自 branded Id、version、时间和关系引用定义最小 Reference Contract；SourceEvent 含 externalId/sourceId/observedAt；不冻结未来业务字段。VocabularyEntry 不按考试复制；NewsEvent 引用 Content；ProjectTask 引用 Task。

`packages/contracts/domain/commands.ts` 定义 discriminated union：

```ts
export type DomainCommand =
 | { type: 'workspace.create'; commandId: string; name: string; rootHandle: string }
 | { type: 'task.create'; commandId: string; title: string; owner: { kind: 'workspace'; id: string } }
 | { type: 'task.complete'; commandId: string; taskId: Id<'task'>; expectedVersion: number }
 | { type: 'artifact.register'; commandId: string; fileHandle: string; sha256: string; kind: string }
 | { type: 'approval.resolve'; commandId: string; approvalId: Id<'approval'>; decision: 'APPROVED' | 'DENIED' };
export interface CommandReceipt { commandId: string; entityId: string; entityVersion: number; eventIds: string[] }
export interface DomainCommandBus {
 execute(command: DomainCommand, context: RequestContext): Promise<Result<CommandReceipt>>;
}
```

Workspace/Task/Artifact 是跨阶段基础 PoC，不是课程或项目实践业务。`rootHandle`/`fileHandle` 来自可信系统选择器及已授权范围，不是任意路径。

`packages/core/domain/ports.ts`：`UnitOfWork.run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>`；TransactionContext 仅暴露 repositories/events/commandReceipts，不含裸 connection；DomainCommandBus 由 Main 注入，Agent 只获受限 proposal/command 工具。

### C3. Permission / Approval

`packages/contracts/domain/permission.ts`：Capability 字符串由注册表白名单管理；Scope 包含 workspace/course/project/filesystem/network/credential/tool/model/git/process。`OperationRequest` 包含 capability、resource handle、payloadHash、toolVersion、runId、dataClassification、provider/model、预算上限及有效期。`PolicyDecision` 为 ALLOW/DENY/REQUIRE_APPROVAL，DENY 带 reason。

`packages/core/permissions/policy.ts`：`evaluate(operation: OperationRequest, context: RequestContext): PolicyDecision`。
`packages/core/approvals/service.ts`：`request(operation, context): Promise<Result<Approval>>`、`resolve(id, decision, trustedUserContext): Promise<Result<Approval>>`、`consume(id, operation, context): Promise<Result<void>>`。

Approval 包含 Master 全部字段 approvalId/runId/requestedCapability/scope/reason/riskLevel/requestedAt/resolvedAt/decision，另加 proposed payloadHash、toolVersion、expiresAt、consumedAt、policyVersion，避免同意被挪用。显式预算授权采用有上限的 policy grant，不能用单次审批无限消费。

执行顺序：硬保护 → 身份/范围/权限有效性 → 风险策略 → 精确审批 → 执行前再次确认范围/撤销状态 → 副作用。没有权限与待审批区分；DENY 不变成审批邀请。新 run、fork、扩大 scope 均不继承可消费审批。

### C4. Event / Storage

`packages/contracts/domain/events.ts`：DomainEventEnvelope 含 Master 的 eventId/eventType/aggregateType/aggregateId/occurredAt/actor/correlationId/causationId/schemaVersion/payload，并加 workspaceId、aggregateVersion、全局 seq（存储分配）。
`packages/core/events/ports.ts`：`append(tx, event): Promise<void>`；`read(workspaceId, afterSeq, limit): Promise<DomainEventEnvelope[]>`；`rebuild(name, workspaceId): Promise<void>`。

DomainEvent 与 AgentEvent 两种表、两种类型；重要状态+事件+command receipt 同事务。事件不是通用数据库日志，不保存原始模型 prompt/密钥。投影按 eventId 幂等、offset 同事务，订阅仅 commit 后发送。禁止声称全系统采用 event sourcing；只有 AgentRun 投影提案以 AgentEvent 为权威，见 G1。

### C5. Workspace / IPC

`packages/infrastructure/files/authorized-path.ts`：`resolveAuthorized(handle, relativePath, operation, context): Promise<Result<AuthorizedPath>>`；AuthorizedPath 为不可从 IPC 构造的内部对象，含 root identity、canonical path、policy version。包含大小写、UNC/device path、ADS、junction/symlink、硬链接以及路径检查后替换的 Windows 风险；无法安全检查则拒绝。不能把 cwd 当沙箱。

`packages/contracts/ipc/api.ts` 仅暴露：`health()`、`chooseWorkspace()`、`createWorkspace({name,rootHandle})`、`createTask({title})`、`completeTask({taskId,expectedVersion})`、`inspectRun({runId})`、`startFixtureRun({fixtureId,runtime})`、`pauseRun({runId})`、`resumeRun({runId})`、`cancelRun({runId})`、`resolveApproval({approvalId,decision})`、`onRunEvent(callback): unsubscribe`。fixture API 仅 dev/test build 存在，不能接受自定义代码/命令。每个调用返回 Promise<Result<相应DTO>>；流为经过过滤的事件 DTO。

固定 IPC channel 对应 `uf:health`、`uf:workspace:choose`、`uf:workspace:create`、`uf:task:create`、`uf:task:complete`、`uf:run:inspect`、`uf:run:fixture`、`uf:run:pause`、`uf:run:resume`、`uf:run:cancel`、`uf:approval:resolve`、`uf:run:event`。无通用 invoke、fs、shell、SQL、凭据 API。Main 验证 sender/frame/origin、长度与 schema、对象归属、会话身份；事件回调不泄露 ipcRenderer event 对象。

### C6. Model / Tool

`packages/contracts/model/gateway.ts`：

```ts
export interface ModelRequest {
  purpose: string; messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  requiredCapabilities: string[]; dataClass: 'PUBLIC' | 'PRIVATE' | 'SENSITIVE';
  routeOverrides: Partial<Record<'run' | 'preset' | 'owner' | 'module' | 'global' | 'fallback', string>>;
  maxOutputTokens: number; credentialRef?: string;
}
export interface ModelOutput { text: string; provider: string; model: string; usage: Json; cost: number | null; currency: string | null }
export type ModelChunk = { type: 'delta'; text: string } | { type: 'done'; output: ModelOutput } | { type: 'error'; error: Json };
export interface ModelGateway {
 generate(request: ModelRequest, context: RequestContext, signal: AbortSignal): Promise<Result<ModelOutput>>;
 stream(request: ModelRequest, context: RequestContext, signal: AbortSignal): AsyncIterable<ModelChunk>;
 embed(texts: string[], request: ModelRequest, context: RequestContext, signal: AbortSignal): Promise<Result<number[][]>>;
 probeCapabilities(routeId: string, context: RequestContext): Promise<Result<string[]>>;
 estimateUsage(request: ModelRequest): Result<{ inputTokens: number | null; maxOutputTokens: number; estimatedCost: number | null }>;
}
```

routeOverrides 是可信服务计算的输入，不能让 Agent 指定未经授权 endpoint。fallback 重新经过敏感外发审批和预算；能力不匹配不能静默降级。cost 未知为 null，不是 0。

`packages/contracts/tool/gateway.ts`：`ToolManifest` 包含 Master 全部 id/version/capabilities/inputSchema/outputSchema/filesystemScope/networkScope/credentialScope/riskLevel/approvalPolicy/timeout/resourceLimit/license。`invoke({toolId,version,input,invocationId}, context, signal): Promise<Result<ToolResult>>`；ToolResult 包含 output、provenance、startedAt/endedAt、effectReceipt。`invocationId` 的幂等和恢复结果由调用账本管理；不能仅重试所有工具。

### C7. AgentRuntime

`packages/contracts/agent/runtime.ts`：

```ts
export type RunStatus = 'CREATED' | 'RUNNING' | 'WAITING_APPROVAL' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface RunSpec { taskId: Id<'task'>; definitionId: Id<'agent-definition'>; definitionVersion: number; input: Json; runtime: 'native' | 'langgraph' }
export interface RunSnapshot { id: Id<'agent-run'>; status: RunStatus; version: number; lastSeq: number; pendingApprovalId?: Id<'approval'> }
export interface CheckpointRef { id: string; runId: Id<'agent-run'>; adapter: string; adapterVersion: string; schemaVersion: number; checksum: string }
export interface AgentEvent { eventId: string; runId: Id<'agent-run'>; seq: number; type: string; occurredAt: Instant; payload: Json; correlationId: string }
export interface AgentRuntime {
 createRun(spec: RunSpec, context: RequestContext): Promise<Result<RunSnapshot>>;
 start(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<RunSnapshot>>;
 stream(runId: Id<'agent-run'>, afterSeq: number, context: RequestContext, signal: AbortSignal): AsyncIterable<AgentEvent>;
 pause(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<RunSnapshot>>;
 resume(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<RunSnapshot>>;
 cancel(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<RunSnapshot>>;
 interrupt(runId: Id<'agent-run'>, reason: string, context: RequestContext): Promise<Result<RunSnapshot>>;
 checkpoint(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<CheckpointRef>>;
 fork(runId: Id<'agent-run'>, checkpointId: string, context: RequestContext): Promise<Result<RunSnapshot>>;
 inspect(runId: Id<'agent-run'>, context: RequestContext): Promise<Result<RunSnapshot>>;
}
```

AgentDefinition 在 `packages/contracts/agent/definition.ts` 明确 id/role/domain/modelPolicy/promptVersion/contextPolicy/toolPolicy/permissionPolicy/budgetPolicy/outputSchema/version。Adapter 获网关接口，不获数据库/凭据。

允许 CREATED→RUNNING/CANCELLED；RUNNING→WAITING_APPROVAL/PAUSED/FAILED/CANCELLED/COMPLETED；WAITING_APPROVAL→RUNNING（审批有效）/PAUSED/CANCELLED/FAILED；PAUSED→RUNNING（重验）/CANCELLED/FAILED。终态不可重开；FAILED 恢复创建关联 retry run 并引用可用 checkpoint，保留旧失败历史。崩溃遗留 RUNNING 在启动恢复时标 PAUSED 或 FAILED 并留原因，不自动续发工具。fork 新 run、新授权，不能复制外部副作用。

### C8. Sidecar / Knowledge / Backup

`packages/contracts/sidecar/protocol.ts`：versioned request {protocolVersion,requestId,correlationId,method,deadline,payload}；response {requestId,ok,result|error}，method 为 start/stop/health/request/cancel/version/shutdown。`SidecarHost.start(id)`、`stop(id)`、`health(id)`、`request(id,request,signal)`、`cancel(id,requestId)`、`version(id)`、`shutdown()` 全为 Promise<Result<Json>>。正式数据经受控文件 handle/独立临时目录传递，不授整个 Workspace。

`packages/contracts/domain/memory.ts`：Receipt→Evidence→Candidate→Claim→Outcome；Claim 必有 evidenceRefs、scope、authorization、confidence、source、createdAt/reviewedAt、version。`MemoryService.propose(receiptId,context)`、`accept(candidateId,authorizationId,context)`、`forget(claimId,context)` 返回 Promise<Result<Json>>；`KnowledgeService.search(query,scope,context)` 返回 Result<Array<{sourceId,locator,excerpt,hash}>>。权限过滤在检索前与结果返回前执行。

`packages/infrastructure/backup/manifest.ts`：manifest 包含 formatVersion/schemaVersion/appVersion/createdAt/files(path,size,sha256,classification)/exclusions。`createBackup(scope,context)`、`validateBackup(handle)`、`restoreToStaging(handle,context)`、`activateRestore(stagingHandle,context)` 均返回 Promise<Result<Json>>。恢复到临时区完整检查后再切换，不能覆盖后验证。

## D. SQLite Schema 提案

归属 `packages/infrastructure/sqlite/migrations/0001-foundation.sql`；迁移历史存 `schema_migrations`。列类型为 SQLite TEXT/INTEGER；标识 TEXT 由 branded ID 边界校验；UTC 时间 TEXT；JSON TEXT 必须 json_valid。所有可变实体有 version≥1；外键开启，业务变更与事件在一个事务。

| 表 | 主键/字段及约束 | 真源/用途 |
|---|---|---|
| schema_migrations | version INTEGER PK, checksum TEXT NOT NULL, applied_at TEXT NOT NULL | 已执行 migration，不允许改旧文件哈希 |
| workspaces | id PK, name NOT NULL, root_handle UNIQUE NOT NULL, status CHECK ACTIVE/READ_ONLY, version, created_at, updated_at | Workspace 真源；不向 Renderer 泄露路径 |
| tasks | id PK, workspace_id FK workspaces RESTRICT, owner_kind, owner_id, title, status CHECK C2, version, created_at, updated_at | Unified Task；本阶段 owner 仅 workspace |
| domain_events | seq INTEGER PK AUTOINCREMENT, event_id UNIQUE, workspace_id FK, aggregate_type, aggregate_id, aggregate_version, event_type, occurred_at, actor_id, correlation_id, causation_id nullable, schema_version, payload JSON; UNIQUE(aggregate_type,aggregate_id,aggregate_version) | 权威业务变更记录；不代替所有业务表 |
| agent_events | global_seq INTEGER PK AUTOINCREMENT, event_id UNIQUE, run_id, run_seq, workspace_id FK, type, occurred_at, correlation_id, payload JSON; UNIQUE(run_id,run_seq) | Agent 历史真源；首条 RunCreated 包含恢复最小输入引用 |
| agent_runs | id PK, workspace_id FK, task_id FK tasks, definition_id, definition_version, runtime, status CHECK C7, version, last_seq, created_at, updated_at | G1 待确认：agent_events 同事务快照，不独立写 |
| approvals | id PK, workspace_id FK, run_id nullable, capability, scope JSON, reason, risk_level CHECK LOW/MEDIUM/HIGH, payload_hash, tool_version, policy_version, requested_at, expires_at, resolved_at nullable, decision CHECK PENDING/APPROVED/DENIED/EXPIRED, consumed_at nullable | 统一审批真源；非 Agent 请求允许 run 空 |
| permissions | id PK, workspace_id FK, actor_id, run_id nullable, task_id nullable, capability, scope JSON, granted_at, expires_at, revoked_at nullable, policy_version | 临时 grant 与撤销；作用域不可隐式扩大 |
| artifacts | id PK, workspace_id FK, run_id nullable, managed_file_id FK managed_files, kind, sha256, created_at, version | 统一引用，非正文副本 |
| settings_refs | workspace_id FK, key, value JSON, credential_ref nullable; PK(workspace_id,key) | 非敏感配置/引用，禁止 key/value 偷存 secret |
| recycle_bin | id PK, workspace_id FK, entity_type, entity_id, deleted_at, purge_after, restore_metadata JSON, version; UNIQUE(entity_type,entity_id) | 30 天回收元数据，正文仍在受控 trash |
| managed_files | id PK, workspace_id FK, relative_path, sha256, size_bytes CHECK >=0, state CHECK STAGED/ACTIVE/TRASH/MISSING, original_ref nullable, created_at; UNIQUE(workspace_id,relative_path) | 文件元数据；文件正文是 Managed Copy 真源 |
| command_receipts | command_id PK, workspace_id FK, payload_hash, entity_id, entity_version, event_ids JSON, completed_at | 同命令同内容返回相同结果，异内容拒绝 |
| projection_offsets | workspace_id FK, projection_name, last_seq; PK(workspace_id,projection_name) | 可重建进度 |
| tool_invocations | invocation_id PK, run_id, tool_id, tool_version, payload_hash, status CHECK STARTED/SUCCEEDED/FAILED/UNKNOWN, effect_receipt JSON nullable | 副作用幂等/不确定状态恢复账本；不是领域对象真源 |

后五项为落实幂等/文件恢复新增的技术表，需数据模型审阅认可。无 courses/exams/vocabulary/news/project 业务表。agent_events 不设到快照 agent_runs 的循环外键，重建快照时不会删除历史；run/task 合法性由同事务服务约束，必须有测试。

关键 SQL 形态（规划示例，不是已执行 migration）：

```sql
PRAGMA foreign_keys = ON;
CREATE TABLE schema_migrations (
 version INTEGER PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL
);
CREATE UNIQUE INDEX agent_events_run_order ON agent_events(run_id, run_seq);
CREATE INDEX tasks_workspace_status ON tasks(workspace_id, status);
CREATE INDEX approvals_pending ON approvals(workspace_id, decision, expires_at);
CREATE INDEX domain_events_workspace_order ON domain_events(workspace_id, seq);
```

WAL/busy timeout/native binding 由 ADR-0003 基于 Windows 实测选定；不能在未核验时声称性能达标。迁移 runner：备份一致快照→检查版本/哈希→BEGIN IMMEDIATE→执行新 migration→记录版本→COMMIT→integrity_check。失败关闭写入；使用经过验证的迁移前备份或 forward fix，不执行未经验证 down migration。

Personal Core PoC 另用临时私有 `personal-core.sqlite`，表 receipts/evidence/memory_candidates/memory_claims/claim_evidence/outcomes/forget_tombstones，Claim 只能通过 admission service 写；不接通用导出。FTS5 独立派生 `knowledge-index.sqlite`，表 source_index 与 source_fts；Markdown 内容仅缓存索引，删除后从授权来源重建。最终 Personal Schema 不在 Stage 0 擅自冻结为业务正式版本。

Workspace 路径：managed/projects/cache/indexes/runtime/backups/trash；领域 DB 由可信应用数据根管理，Personal Core 在隔离私有根；Vault/Git working copy 通过引用连接，不复制成第二正式正文。此物理布局是 G1/G4 需审阅的实施提案。

---

## E. 任务执行约定

Task 0.1～0.17 严格按 Master 编号。每个任务先把下述验收场景写成失败测试，再最小实现；每个 checklist 可继续拆成 2～5 分钟动作，但不得跨任务跳门禁。

测试中的合成 fixture 是工程测试工具，不冒充真实模型/Sidecar结果。PoC evidence 分 `automated-fixture` 与 `live-integration`；真实外部能力未运行写 BLOCKED 及原因，不能标 PASS。每任务报告路径为 `docs/test-evidence/stage-0/task-0.N.md`（N 对应该编号），记录命令、cwd、commit、平台/版本、开始结束时间、退出码、断言、失败与重试、脱敏日志、产物哈希。

以下 npm scripts 是 Task 0.1/0.17 要建立的未来规范，当前不存在、未运行；在 scripts 尚未建立前 MODULE_NOT_FOUND 不能作为业务失败测试证据。

## Task 0.1 — 工程基线、治理与最小窗口

**Create:** `package.json`, `package-lock.json`, `.gitignore`, `.node-version`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `vitest.config.ts`, `playwright.config.ts`, `.github/workflows/stage-0.yml`, `scripts/check-boundaries.mjs`, `scripts/check-doc-links.mjs`, `scripts/check-baseline.mjs`, `scripts/run-test-group.mjs`, `apps/desktop/package.json`, `apps/desktop/tsconfig.json`, `apps/desktop/forge.config.ts`, `apps/desktop/src/main/index.ts`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/renderer/index.html`。

每个 B 表 package 创建确切 `<目录>/package.json`、`<目录>/tsconfig.json`、`<目录>/index.ts`；此统一三文件规则仅用于 B 表九个明确目录，不扩展到未来 domain 包。生成 lockfile 只发生在许可/版本核验后。

**Docs:** `docs/governance/third-party-registry.md`, `docs/decisions/ADR-template.md`, `docs/test-evidence/TEMPLATE.md`, `docs/release/stage-0-checklist.md`, `docs/decisions/ADR-0001-desktop-runtime.md`, `docs/decisions/ADR-0002-repository-boundaries.md`, `docs/decisions/ADR-0003-sqlite-binding.md`, `docs/decisions/ADR-0004-credential-storage.md`, `docs/decisions/ADR-0005-agent-runtime-boundary.md`, `docs/decisions/ADR-0006-sidecar-protocol.md`, `docs/test-evidence/stage-0/dependency-review.md`。

**Tests:** `tests/engineering/baseline.test.ts`, `tests/architecture/dependency-boundaries.test.ts`, `apps/desktop/tests/launch.spec.ts`。

**Consumes/Produces:** 四份已批准真源；产出可离线启动的技术窗口、严格 TS、统一脚本，暂不暴露任何业务 IPC。

- [ ] 在已批准 worktree 写 baseline 检查：缺 strict、lock、脚本或 forbidden import 时失败；注入临时违规 import fixture，验证规则确实发现它。
- [ ] 核验官方版本/许可证、安全公告及原生模块 ABI；ADR 记录精确版本、备选理由、证据 URL/时间与获批状态。生产包未获确认不安装。
- [ ] 建 npm workspaces、Vitest/Playwright入口、lint/typecheck，最小窗口 `nodeIntegration:false, contextIsolation:true, sandbox:true`；暂不加 React 产品组件。
- [ ] 运行 `npm ci`、`npm run typecheck`、`npm run lint`、`npm run unit -- tests/engineering/baseline.test.ts tests/architecture/dependency-boundaries.test.ts`、`npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts`。预期全通过、窗口可启动且无真实数据。
- [ ] 保存证据并 commit：`chore: establish uniforge engineering baseline`。

**Rollback:** 本任务 commit 可 revert；保留 registry/失败证据；仅清理该 worktree 的可再生成依赖与 build 输出，先核验绝对路径，不删除用户数据。

## Task 0.2 — Domain Contracts

**Create:** `packages/contracts/domain/primitives.ts`, `entities.ts`, `commands.ts`, `events.ts`, `permission.ts`, `memory.ts`（这些短名均位于 `packages/contracts/domain/`）；`packages/core/domain/ports.ts`, `packages/core/domain/task.ts`, `packages/core/domain/workspace.ts`, `packages/core/errors/result.ts`, `packages/core/application/command-bus.ts`。

**Tests:** `packages/core/domain/task.test.ts`, `packages/contracts/domain/serialization.test.ts`, `tests/architecture/dependency-boundaries.test.ts`。

**Interfaces:** 实现 C1/C2；其余领域只引用契约。`completeTask(task, expectedVersion): Result<Task>` 为纯函数，非法版本/终态拒绝。

- [ ] 写失败测试：UTC/ID 拒绝、JSON round-trip、Task 状态/版本；断言非法完成不改原对象。
- [ ] `npm run unit -- packages/core/domain/task.test.ts packages/contracts/domain/serialization.test.ts` 应在新增合法断言上失败。
- [ ] 实现纯类型、解析和状态迁移；无数据库和模型 SDK。建立合成 Task fixture，owner 仅 workspace。
- [ ] 目标测试 + `npm run check-boundaries` + `npm run typecheck` 通过；标记 Contract V1 候选，等待阶段验收冻结。
- [ ] 证据/commit：`feat: define core domain contracts`。

测试示例形态：

```ts
it('rejects completing a cancelled task without mutation', () => {
 const task = { ...createdTaskFixture, status: 'CANCELLED' as const };
 const result = completeTask(task, task.version);
 expect(result).toMatchObject({ ok: false, error: { code: 'INVALID_TRANSITION' } });
 expect(task.status).toBe('CANCELLED');
});
```

`createdTaskFixture` 在本任务测试文件内定义符合 C2 的固定有效 Task，不读取真实数据。

**Rollback:** revert 本任务，保留 Contract 审查记录；不创建/迁移未来业务表。

## Task 0.3 — SQLite 与 Migration

**Create:** `packages/infrastructure/sqlite/database.ts`, `transaction.ts`, `migration-runner.ts`, `migrations/0001-foundation.sql`, `repositories/workspace-repository.ts`, `repositories/task-repository.ts`, `repositories/approval-repository.ts`, `repositories/artifact-repository.ts`, `repositories/command-receipt-repository.ts`（均位于 `packages/infrastructure/sqlite/`）；`tests/fixtures/sqlite/previous-schema.sql`, `tests/fixtures/sqlite/failing-migration.sql`。

**Tests:** `packages/infrastructure/sqlite/migration.test.ts`, `transaction.test.ts`, `repositories.test.ts`（同目录）；`tests/recovery/sqlite-restart.test.ts`。

**Interfaces:** `openDatabase(location, mode): Promise<DatabaseHandle>` 仅基础设施可见；`migrate(handle): Promise<Result<{version:number}>>`；实现 UnitOfWork/repository ports，返回 Domain Entity。

- [ ] 写 empty→latest、旧版→latest、同版本重跑、checksum 改动、FK/UNIQUE、事务回滚、进程中断测试；旧版 fixture 来自测试专用早期 Schema，不伪称真实历史发行版。
- [ ] `npm run integration -- packages/infrastructure/sqlite/migration.test.ts packages/infrastructure/sqlite/transaction.test.ts packages/infrastructure/sqlite/repositories.test.ts`，先确认失败。
- [ ] 按获批 D 表建表，备份/版本检查失败立即关闭写入；SQL 使用参数绑定。初期 migration 前快照仅内部实现，Task 0.15 接完整恢复协议。
- [ ] 运行目标集成及 `npm run recovery -- tests/recovery/sqlite-restart.test.ts`；重启后数据保留、失败 migration 不能写、没有孤儿事件。
- [ ] 证据/commit：`feat: add sqlite schema and migration system`。

**Rollback:** 停止应用→验证迁移前快照→恢复至新临时 DB→integrity_check→切换；代码 revert 不等于 DB 降级。保留失败 DB 的受控诊断副本，不覆盖原数据。

## Task 0.4 — Domain Event 与 Projection

**Create:** `packages/core/events/ports.ts`, `packages/core/events/projection.ts`, `packages/infrastructure/sqlite/event-store/domain-event-store.ts`, `packages/infrastructure/sqlite/event-store/projection-store.ts`, `packages/core/application/foundation-service.ts`。

**Tests:** `packages/infrastructure/sqlite/event-store/domain-event-store.test.ts`, `tests/integration/foundation-command.test.ts`, `tests/recovery/projection-rebuild.test.ts`。

**Interfaces:** C2 DomainCommandBus、C4 append/read/rebuild；PoC WorkspaceCreated/TaskCreated/TaskCompleted/ApprovalGranted/ArtifactCreated；后续 Task 0.5/0.7 接真实审批与文件注册，当前未接通的命令返回 UNAVAILABLE。

- [ ] 测试一次命令业务+事件+receipt 原子提交、重复 command 幂等/异 payload 冲突、重复 eventId 拒绝、跨 Workspace 读拒绝。
- [ ] `npm run integration -- packages/infrastructure/sqlite/event-store/domain-event-store.test.ts tests/integration/foundation-command.test.ts` 先红。
- [ ] 写 commit 后通知、投影 offset 幂等、分页 seq 与版本校验；领域状态不由任意 Agent event 修改。
- [ ] 目标测试及 `npm run recovery -- tests/recovery/projection-rebuild.test.ts`：删除派生投影后重建一致；事务回滚不广播事件。
- [ ] 证据/commit：`feat: add domain event store and projections`。

**Rollback:** revert 消费者改动；从最后正确 seq 重建投影，不删领域事件或伪造事件。

## Task 0.5 — Permission / Approval

**Create:** `packages/core/permissions/policy.ts`, `grants.ts`, `protected-resources.ts`（位于 `packages/core/permissions/`）；`packages/core/approvals/service.ts`, `packages/core/identity/trusted-context.ts`。

**Tests:** `packages/core/permissions/policy.test.ts`, `packages/core/approvals/service.test.ts`, `tests/security/approval-replay.test.ts`, `tests/security/cross-workspace.test.ts`。

**Interfaces:** C3；Task 0.7 加入 OS 实际路径解析前，所有任意文件/进程能力保持拒绝。

- [ ] 写 LOW/MEDIUM/HIGH 矩阵、拒绝范围、临时过期、撤销、任务结束、跨项目、审批复用/payload更改/工具版本更改/并发消费失败断言。
- [ ] `npm run unit -- packages/core/permissions/policy.test.ts packages/core/approvals/service.test.ts` 确认失败。
- [ ] 实现 fail closed、事务一次性 consume、审批者身份只来自 Main、硬保护优先；HIGH 无批准不能副作用。C4 决策未确认则不扩大数据库相关授权。
- [ ] `npm run security -- tests/security/approval-replay.test.ts tests/security/cross-workspace.test.ts`；全目标通过后接回 foundation-service 的审批命令。
- [ ] 证据/commit：`feat: implement permission and approval core`。

**Rollback:** 禁用新增能力/撤销 grant，再 revert；不能通过放宽 policy 回滚至不安全版本。Pending Approval 留痕但不自动批准。

## Task 0.6 — Electron Security / IPC

**Create:** `packages/contracts/ipc/api.ts`, `schemas.ts`, `dto.ts`（位于 `packages/contracts/ipc/`）；`apps/desktop/src/main/ipc/register.ts`, `authorize-sender.ts`, `handlers.ts`（位于 `apps/desktop/src/main/ipc/`）。
**Modify:** `apps/desktop/src/main/index.ts`, `apps/desktop/src/preload/index.ts`。
**Tests:** `apps/desktop/tests/ipc-security.spec.ts`, `tests/security/ipc-payload.test.ts`。

**Interfaces:** C5 whitelist；未就绪 Runtime handler 返回 UNAVAILABLE，不伪造成功。Preload 不直接暴露 ipcRenderer。

- [ ] 测 Node globals 缺失、未知 channel/额外字段/超大 payload/恶意路径/伪造 actor/iframe sender 被拒，事件 unsubscribe 有效。
- [ ] `npm run e2e-smoke -- apps/desktop/tests/ipc-security.spec.ts` 先确认有意义的拒绝断言失败。
- [ ] Main 二次校验并调用 Application Services；本地内容 CSP、阻止非白名单导航/新窗口、不开任意 external URL；只显示技术状态文字。
- [ ] 运行上述 E2E、`npm run security -- tests/security/ipc-payload.test.ts`、typecheck；确认 renderer bundle 不含 SQL/provider/runtime 实现。
- [ ] 证据/commit：`feat: establish typed ipc security boundary`。

**Rollback:** 移除新增 IPC channel；保留 sandbox/contextIsolation/nodeIntegration 安全配置；不临时打开 Node 解决测试问题。

## Task 0.7 — Workspace / File Ownership

**Create:** `packages/infrastructure/files/authorized-path.ts`, `protected-path-policy.ts`, `managed-copy.ts`, `workspace-layout.ts`, `file-transaction.ts`（位于 `packages/infrastructure/files/`）；`packages/core/domain/workspace/service.ts`, `tests/fixtures/workspace/README.md`。
**Tests:** `packages/infrastructure/files/managed-copy.test.ts`, `tests/security/windows-path-boundary.test.ts`, `tests/recovery/file-transaction.test.ts`。

**Interfaces:** C5 resolver；`importManaged(sourceHandle, context): Promise<Result<{fileId:string;sha256:string}>>`；`createWorkspace` 仅用系统选择器确认 handle。

- [ ] 测原始文件删除后 Managed Copy 保留；越界 ../、大小写别名、junction、symlink、硬链接、UNC/device/ADS、Project A→B、源码 worktree/安装/更新/权限内核被拒，即使“批准”也不能写。
- [ ] `npm run security -- tests/security/windows-path-boundary.test.ts` 先红；无 Windows 权限创建某类链接时明确 BLOCKED，不用 skip 冒充通过。
- [ ] 先 canonical 授权，再 staging 文件/哈希、同事务元数据事件，原子 rename 后状态 ACTIVE；中断 STAGED/MISSING 可恢复；读取前检查链接竞争。尚无强安全能力的路径类型默认拒绝。
- [ ] `npm run integration -- packages/infrastructure/files/managed-copy.test.ts`、`npm run recovery -- tests/recovery/file-transaction.test.ts`；核验 trash 不进入搜索。
- [ ] 证据/commit：`feat: add workspace ownership and path security`。

**Rollback:** revert import 服务；保留 managed 真源和 manifest；只处理明确 STAGED 的该任务临时文件，不删除用户源文件/Git/Vault。

## Task 0.8 — Provider-neutral Model Gateway

**Create:** `packages/contracts/model/gateway.ts`, `packages/platform-model/gateway.ts`, `packages/platform-model/router.ts`, `packages/platform-model/budget.ts`, `packages/platform-model/providers/openai-compatible.ts`, `packages/platform-model/providers/anthropic-messages.ts`, `packages/infrastructure/credentials/windows-credential-store.ts`, `packages/infrastructure/logging/redact.ts`, `scripts/poc-model.mjs`。
**Tests:** `packages/platform-model/router.test.ts`, `packages/platform-model/gateway.test.ts`, `tests/integration/model-protocols.test.ts`, `tests/security/model-egress.test.ts`, `tests/integration/windows-credentials.test.ts`。
**Fixtures:** `tests/fixtures/model/openai-stream.txt`, `tests/fixtures/model/anthropic-stream.txt`（自制协议 fixture，不含真实 prompt/secret）。

**Interfaces:** C6；CredentialStore 的 `get(ref, trustedContext): Promise<Result<SecretHandle>>` / `set(ref, secret, trustedContext): Promise<Result<void>>`，仅 Main 基础设施使用；SecretHandle 禁止 stringify。Provider SDK 若需引入必须先登记；协议使用 fetch 也必须核验官方 API。

- [ ] 测六层 route precedence、fallback 重新审查、stream abort、能力不支持、缺 credential、费用 null、预算预留/结算并发不超支、敏感数据换 Provider 要新审批。
- [ ] `npm run unit -- packages/platform-model/router.test.ts packages/platform-model/gateway.test.ts` 确认失败。
- [ ] 最小接两种协议形态：OpenAI-compatible 与 Anthropic Messages，并提供单独自定义 base URL/model 的兼容配置。endpoint 只能由可信配置注册；重定向/请求日志不得携带 secret。
- [ ] `npm run integration -- tests/integration/model-protocols.test.ts tests/integration/windows-credentials.test.ts`，验证真实 OS 凭据写读删除（临时测试 credential）；`npm run security -- tests/security/model-egress.test.ts`。
- [ ] `npm run poc:model` 分别调用已授权的两种协议服务和自定义兼容配置，使用非敏感合成文本。记录 endpoint 类别、模型/协议版本、实际 usage、错误/取消和成本已知性；没有账号/预算授权时标 BLOCKED，不发送真实用户内容，也不能由本地协议 fixture 代替联网 PoC。
- [ ] 证据/commit：`feat: add provider-neutral model gateway`。

**Rollback:** 停用新 Provider 和 route，撤销相关临时 grant，删除测试 credential；旧配置不包含密钥。敏感 fallback 失败停止，不切换到未授权供应商。

## Task 0.9 — Tool Gateway / MCP / Local / Git / API PoC

**Create:** `packages/contracts/tool/gateway.ts`, `packages/platform-tool/gateway.ts`, `packages/platform-tool/registry.ts`, `packages/platform-tool/invocation-ledger.ts`, `packages/platform-tool/tools/read-foundation-task.ts`, `packages/platform-tool/tools/read-managed-file.ts`, `packages/platform-tool/tools/write-test-artifact.ts`, `packages/platform-tool/tools/git-status.ts`, `packages/platform-tool/tools/local-cli.ts`, `packages/platform-tool/tools/http-read.ts`, `packages/platform-tool/mcp/client.ts`, `packages/platform-tool/mcp/adapter.ts`, `tests/fixtures/mcp/server.ts`, `tests/fixtures/process/echo-input.mjs`, `scripts/poc-mcp.mjs`。
**Tests:** `packages/platform-tool/gateway.test.ts`, `tests/integration/mcp-roundtrip.test.ts`, `tests/integration/local-tools.test.ts`, `tests/security/tool-boundary.test.ts`, `tests/recovery/tool-disconnect.test.ts`。

**Interfaces:** C6 manifest/invoke；调用账本写 STARTED→effect receipt→SUCCEEDED；崩溃无 receipt 时 UNKNOWN，未经 reconciliation 不自动重试写入。

- [ ] 测 input/output schema、超时、cancel、权限拒绝、result provenance、同 invocation 重放、非幂等工具 UNKNOWN、不可信 MCP response/工具描述不能扩大权限。
- [ ] `npm run unit -- packages/platform-tool/gateway.test.ts` 和 `npm run integration -- tests/integration/mcp-roundtrip.test.ts tests/integration/local-tools.test.ts` 确认新增断言先失败。
- [ ] 实现内部只读 Task 工具、managed file 读、HIGH 审批后向专用临时目录写测试 Artifact；Git 仅自建临时 repo 的 status/diff，不 clone 用户仓库、不 push；CLI 仅固定 echo helper/固定参数；HTTP 仅 loopback 测试 API。所有工具必须 manifest 完整。
- [ ] 用真实 MCP SDK 建本地 stdio server/client，握手/list/call/disconnect/cancel/error 大小限制/版本不兼容可观察；stderr 脱敏、stdout 仅协议。禁止请求任意 server command。
- [ ] `npm run security -- tests/security/tool-boundary.test.ts`、`npm run recovery -- tests/recovery/tool-disconnect.test.ts`、`npm run poc:mcp`。记录真实进程 roundtrip；协议 stub 单元测试不能冒充 SDK 互通。
- [ ] 证据/commit：`feat: implement tool gateway and mcp adapter`。

**安全限制:** Stage 0 不提供通用终端/任意 CLI/MCP 启动器。对受控 fixture 的验证不能推导“不可信子进程已经沙箱化”；G3 无 OS 隔离方案时任意代码执行保持不可用。Git hooks、用户 git config、shell expansion 等在 fixture 中隔离禁用。

**Rollback:** 禁用新增工具/断开 MCP、取消进程；保留失败及副作用账本；UNKNOWN 不能改成成功。仅清理验证过路径的临时 repo。

## Task 0.10 — AgentRuntime Contract / Event Lifecycle

**Create:** `packages/contracts/agent/runtime.ts`, `packages/contracts/agent/definition.ts`, `packages/platform-agent/run-service.ts`, `packages/platform-agent/agent-event-store.ts`, `packages/platform-agent/recovery.ts`, `packages/platform-agent/runtime-registry.ts`。
**Tests:** `packages/platform-agent/run-service.test.ts`, `tests/integration/agent-event-projection.test.ts`, `tests/security/run-authorization.test.ts`, `tests/recovery/run-lifecycle.test.ts`。

**Interfaces:** C7 完整十个方法；实现公共状态/事件/授权和 adapter registry。Adapter 特定 checkpoint 不混进领域表；agent_runs 仅由 RunService 的事件事务更新。

- [ ] 覆盖全部非法迁移、cancel 幂等、暂停后不得发新工具、WAITING_APPROVAL 不自动继续、终态不变、分页/断线 stream、越权 inspect、fork 不继承 grant。
- [ ] `npm run unit -- packages/platform-agent/run-service.test.ts`、`npm run integration -- tests/integration/agent-event-projection.test.ts` 先红。
- [ ] 实现 AgentEvent 驱动快照提案（G1 确认后）；status/version/lastSeq 一致写，失序/重复事件拒绝，runtime 注册只接自有接口。
- [ ] `npm run recovery -- tests/recovery/run-lifecycle.test.ts`、`npm run security -- tests/security/run-authorization.test.ts`；删除快照可从历史重建，不能反向删除事件。
- [ ] 证据/commit：`feat: define agent runtime contract`。

**Rollback:** 关闭 registry 新 adapter；保留 AgentEvent/Artifact 和关联 retry 历史；不篡改失败 run 成功状态。旧 adapter 无法读新 checkpoint 则明确 UNAVAILABLE。

## Task 0.11 — Native Runtime

**Create:** `packages/platform-agent/native/runtime.ts`, `packages/platform-agent/native/operations.ts`, `fixtures/documents/foundation-passage.txt`, `fixtures/documents/foundation-passage.pdf`, `fixtures/documents/README.md`, `scripts/poc-native.mjs`。
**Tests:** `packages/platform-agent/native/runtime.test.ts`, `tests/integration/native-without-langgraph.test.ts`, `tests/security/native-command-boundary.test.ts`。

**Interfaces:** 实现 C7；简单 summarize/explain/extract/draft 经 ModelGateway→可选 ToolGateway→Proposal/Artifact，不自动正式写入；PDF 测试保留同源页码文本 fixture，解析证明在 Task 0.14 补真实 Document Sidecar。

- [ ] 写总结/片段解释/结构化抽取/草稿测试：模型失败不产生 completed、输出不合 schema 拒绝、未确认没有 Domain Write、取消停止流。
- [ ] `npm run unit -- packages/platform-agent/native/runtime.test.ts` 先红。
- [ ] 实现 Native 单步执行与自有事件；pause/cancel 在安全边界停止；Native checkpoint 只支持可恢复的阶段边界，已完成外发不得重复；fork 不复用审批。
- [ ] `npm run integration -- tests/integration/native-without-langgraph.test.ts` 在完全不安装 LangGraph 的裁剪依赖构建/临时验证项目中执行，不能只把配置设 disabled；`npm run security -- tests/security/native-command-boundary.test.ts`。
- [ ] `npm run poc:native` 使用 Task 0.8 已授权协议的真实结果，保存四类输出与状态；PDF 解释的来源链必须明确是已验证提取文本，Task 0.14 后再跑端到端。
- [ ] 证据/commit：`feat: add native agent execution path`。

**Rollback:** 禁用 native operation；留下 partial run/artifact；保留 Core 正常启动。此任务完成不等于课程 AI 已实现。

## Task 0.12 — LangGraph Adapter PoC

**Create:** `packages/platform-agent/langgraph/adapter.ts`, `packages/platform-agent/langgraph/checkpointer.ts`, `packages/platform-agent/langgraph/foundation-graph.ts`, `scripts/poc-langgraph.mjs`。
**Tests:** `packages/platform-agent/langgraph/adapter.test.ts`, `tests/integration/langgraph-approval.test.ts`, `tests/recovery/langgraph-crash.test.ts`, `tests/security/langgraph-boundary.test.ts`。

**Interfaces:** C7；LangGraph import 仅该子目录，独立 export/可选依赖加载；Model/Tool 只能用 C6 注入。运行元数据由 UniForge 保存，checkpoint 存 runtime 隔离分区。

- [ ] 写图：Start→Plan→Read→Approval→Pause→Approve→Write Test Artifact→Checkpoint→模拟进程崩溃→Resume→Complete；测试 approval 前无写入。
- [ ] `npm run integration -- tests/integration/langgraph-approval.test.ts` 先红；随后实现真实锁定版本 LangGraph 图，不能用自写状态机冒充。
- [ ] 让 LangGraph 调网关，checkpoint 保存版本/校验和/安全游标；resume 重验权限、预算、资源哈希；不同 adapter/checkpoint 版本不兼容则安全拒绝。
- [ ] `npm run recovery -- tests/recovery/langgraph-crash.test.ts`：分别在副作用前、已完成但未 checkpoint、checkpoint 后崩溃；Artifact 只创建一次；未知结果停待核对，不盲目重跑。
- [ ] `npm run security -- tests/security/langgraph-boundary.test.ts`、`npm run check-boundaries`、`npm run poc:langgraph`；真实 Runtime 可 stream/interrupt/resume/cancel/recover；重跑 Native 无 LangGraph 门禁。
- [ ] 证据/commit：`feat: add langgraph runtime adapter poc`。

**Rollback:** 禁用 adapter，基础窗口/Domain/Native 保持工作；保留待恢复 checkpoint 和版本，不能把它当普通 cache 删除。没有等价恢复器就如实标记不能恢复该 run。

## Task 0.13 — Knowledge / Personal Memory / FTS5 PoC

**Create:** `packages/platform-knowledge/markdown/source.ts`, `packages/platform-knowledge/obsidian/adapter.ts`, `packages/platform-knowledge/search/fts5.ts`, `packages/platform-knowledge/memory/service.ts`, `packages/platform-knowledge/memory/personal-core.ts`, `packages/platform-knowledge/memory/migrations/0001-poc.sql`, `packages/platform-knowledge/memory/forget.ts`, `fixtures/content/vault/example-note.md`, `fixtures/content/memory-receipt.json`, `scripts/poc-knowledge.mjs`, `docs/decisions/ADR-0007-truth-and-recovery.md`。
**Tests:** `tests/integration/knowledge-poc.test.ts`, `tests/integration/memory-admission.test.ts`, `tests/security/memory-scope.test.ts`, `tests/recovery/knowledge-rebuild.test.ts`。

**Interfaces:** C8；G1/C5/G2/G4 决策记录 ADR-0007；全在合成临时 Vault/私有 PoC store，不接用户真实 Vault/Personal Core。

- [ ] 测 Conversation 不自动记忆、无 Evidence/授权拒绝、冲突 Candidate 不自动覆盖 Claim、不同 scope 不泄露、Outcome 引用来源、删除索引重建、Vault 哈希变化后旧 diff 拒绝。
- [ ] `npm run integration -- tests/integration/knowledge-poc.test.ts tests/integration/memory-admission.test.ts` 先红。
- [ ] 实现 Markdown 源引用/哈希、FTS5 keyword/exact 查询带 citation；Obsidian 只读默认，候选 diff 与确认后写在合成 Vault 中验证，正文唯一真源仍 Markdown。
- [ ] Personal Core 以独立隔离库验证 Receipt/Evidence/Candidate/Claim/Outcome；Forget 撤销 Claim/Evidence 关系并清理派生缓存/索引，保留最小不含 claim 正文的 tombstone 防旧备份复活。私有备份清理/失效策略未批准则不验收 Forget 恢复链。
- [ ] `npm run security -- tests/security/memory-scope.test.ts`、`npm run recovery -- tests/recovery/knowledge-rebuild.test.ts`、`npm run poc:knowledge`；实际 FTS5 构建/查询/重建证据。Bok-inspired 流程不声称已集成 Bok 代码。
- [ ] 语义检索非硬依赖：不启用则写“未启用，可选”，不安装 embedding/vector 包；Bok 代码复用需另行许可审查。
- [ ] 证据/commit：`feat: validate knowledge and memory architecture`。

**Rollback:** 断开实验 adapter、保留 Markdown；可删可重建 FTS 索引，但不得把真实 Memory 当 cache；仅销毁明确标为 synthetic 的 PoC store。

## Task 0.14 — Sidecar Host / OCR / Speech / Document

**Create:** `packages/contracts/sidecar/protocol.ts`, `packages/platform-sidecar/host.ts`, `packages/platform-sidecar/transport.ts`, `packages/platform-sidecar/registry.ts`, `packages/infrastructure/processes/supervisor.ts`, `sidecars/ocr/README.md`, `sidecars/ocr/adapter.py`, `sidecars/ocr/requirements.lock`, `sidecars/speech/README.md`, `sidecars/speech/adapter.py`, `sidecars/speech/requirements.lock`, `sidecars/document/README.md`, `sidecars/document/adapter.py`, `sidecars/document/requirements.lock`, `fixtures/documents/ocr-sample.png`, `fixtures/documents/expected-extraction.json`, `fixtures/documents/layout-sample.pdf`, `fixtures/documents/stt-sample.wav`, `scripts/poc-sidecars.mjs`。
**Tests:** `packages/platform-sidecar/host.test.ts`, `tests/integration/sidecar-protocol.test.ts`, `tests/recovery/sidecar-crash.test.ts`, `tests/security/sidecar-scopes.test.ts`。

**Interfaces:** C8；提案 versioned JSON Lines over stdio，独立 stderr 脱敏日志，message size 上限/timeout 在获批 manifest 中固定。默认候选 PaddleOCR / sherpa-onnx / Docling；whisper.cpp 为替代候选，不同时生产化两套语音。精确版本/模型/资产各自锁定，未认可前不能下载模型或执行安装。

- [ ] 测启动/停止/health/cancel/version/shutdown、未知协议、畸形输出、超时、取消晚到输出、崩溃重启、主进程仍存活、子进程树退出。
- [ ] `npm run unit -- packages/platform-sidecar/host.test.ts`、`npm run integration -- tests/integration/sidecar-protocol.test.ts` 先红。
- [ ] supervisor 只启动登记绝对可执行路径与固定 argv，禁用 shell 拼接；独立临时 input/output；控制继承环境及 credential 可见性；默认无网络。实现固定任务而非可执行任意代码 API。
- [ ] 准备自制可再分发图片、语音、PDF fixtures 和预期文本/表格/citation；通过真实引擎提取。OCR 检查指定词及位置；STT 检查指定短句规范化转写；Document 检查标题/表格/页码。质量阈值在读取结果前固定于 expected-extraction.json，不能事后调低掩盖失败。
- [ ] `npm run recovery -- tests/recovery/sidecar-crash.test.ts`、`npm run security -- tests/security/sidecar-scopes.test.ts`、`npm run poc:sidecars -- --all`，实际跑三类能力。Speech 默认处理后删除原始临时音频。未实际成功的引擎记录 BLOCKED，不能用 echo 文本通过。
- [ ] 重跑 `npm run poc:native -- --document-sidecar` 验证真实 PDF 提取→解释来源链；该子命令由 scripts/poc-native.mjs 实现。
- [ ] 证据/commit：`feat: add sidecar host and capability pocs`。

**Rollback:** stop/shutdown→确认进程树终止→停用 manifest；主程序保留可诊断错误。卸载仅删除受管引擎目录，模型缓存需精确路径检查；不能清空用户 Python/系统环境。

## Task 0.15 — 日志 / 诊断 / 回收 / 备份

**Create:** `packages/infrastructure/logging/logger.ts`, `packages/infrastructure/logging/diagnostics.ts`, `packages/infrastructure/backup/manifest.ts`, `packages/infrastructure/backup/create.ts`, `packages/infrastructure/backup/restore.ts`, `packages/core/domain/recycle-bin/service.ts`, `scripts/poc-recovery.mjs`。
**Modify:** `packages/infrastructure/logging/redact.ts`, `packages/infrastructure/sqlite/migration-runner.ts`, `packages/platform-knowledge/memory/forget.ts`。
**Tests:** `packages/infrastructure/logging/redact.test.ts`, `tests/integration/recycle.test.ts`, `tests/recovery/backup-roundtrip.test.ts`, `tests/security/backup-exclusion.test.ts`, `tests/recovery/forget-restore.test.ts`。

**Interfaces:** C8；30-day recycle metadata；Remove Relation、Delete、Forget 三条路径分离。C5/G4 决定后实行实体/字段 allowlist，不能直接打包整个 SQLite 文件并假设无隐私。

- [ ] 写 secret-pattern/structured-field 脱敏、嵌套异常/URL Header 泄漏、软删除不可检索、30天元数据、损坏 manifest/缺文件/hash不符拒绝、恢复中断不覆盖原 workspace。
- [ ] `npm run unit -- packages/infrastructure/logging/redact.test.ts`、`npm run integration -- tests/integration/recycle.test.ts` 先红。
- [ ] 实现结构日志、崩溃诊断、受控回收、backup 一致快照、manifest 校验、staging restore/atomic activate。Managed Copy 数据与哈希随批准范围备份，不只保存元数据。Git/Vault 只保存引用，不伪称能恢复其外部历史。
- [ ] 备份明确排除 credentials/cookie/Git creds/raw voice/raw chat 与未许可 Personal Core；具体依 C5 批准后的规则。索引可不含完整内容但须能重建。诊断导出同样脱敏，不暗含原始聊天/模型 payload。
- [ ] `npm run recovery -- tests/recovery/backup-roundtrip.test.ts tests/recovery/forget-restore.test.ts`、`npm run security -- tests/security/backup-exclusion.test.ts`、`npm run poc:recovery`；故意放合成 canary secret 验证备份/日志无泄漏。
- [ ] 证据/commit：`feat: add diagnostics recycle and backup foundation`。

**Rollback:** 关闭计划性清理/备份，保留当前数据和验证过快照；任何 restore 先检查新临时目录绝对路径。不通过删除审计/Forget tombstone 来“恢复”。

## Task 0.16 — Windows Build / 安装 / 升级回滚 PoC

**Create:** `scripts/package-windows.mjs`, `scripts/verify-windows-package.mjs`, `tests/packaging/installed-app.spec.ts`, `docs/test-evidence/stage-0/windows-build.md`, `docs/release/stage-0-windows-install.md`。
**Modify:** `apps/desktop/forge.config.ts`, `.github/workflows/stage-0.yml`, `docs/release/stage-0-checklist.md`。
**Tests:** `tests/packaging/installed-app.spec.ts`, `tests/packaging/native-binding.test.ts`。

**Interfaces:** packaging 输出 installer + hash + app/dependency/native ABI/sidecar manifest；Stage 0 测试安装包不是 Stable 发行，不配置正式更新服务器/签名密钥。

- [ ] 编写安装验证断言：独立干净 Windows 环境能启动、真实 SQLite CRUD、FTS5、三 Sidecar health、无源码目录假依赖、卸载不误删用户数据。
- [ ] `npm run package-windows` 先在打包前执行已有 gate，配置/资源缺漏可见失败；不能用 Electron 开发窗口替代安装验证。
- [ ] 核验 Forge maker、native rebuild 与打包资源路径；离线包或明确依赖策略写入 ADR-0001/0006，产物标明 preview/test、签名状态。
- [ ] `npm run verify:windows-package` 对实际 installer 进行安装/启动/卸载检查；VM/干净 Windows 所需能力不可用则记录阻塞，不能宣称 clean Windows 已通过。
- [ ] 造 v0-test-a/v0-test-b 测试版本，备份→受控升级→失败注入→验证回滚；旧 binary 不直接打开不兼容新 schema，使用兼容性检查+验证快照。保留安装/卸载后的用户数据处理记录。
- [ ] 保存 `windows-build.md`，包含 OS 构建号、架构、Electron/Node/SQLite ABI、硬件、installer hash、安装日志、截图、退出码、已知限制。
- [ ] 证据/commit：`build: validate windows packaging pipeline`。

**Rollback:** 在测试 VM 卸载测试 build、恢复已验证兼容 app+data；不回滚到不兼容 DB、不关闭安全策略；无正式更新设施变更。

## Task 0.17 — 测试流水线 / 阶段验收

**Create:** `scripts/check-security.mjs`, `scripts/check-licenses.mjs`, `scripts/generate-sbom.mjs`, `scripts/run-pocs.mjs`, `scripts/stage-0-gate.mjs`, `tests/engineering/pipeline.test.ts`, `docs/test-evidence/stage-0/acceptance.md`, `docs/test-evidence/stage-0/test-summary.md`, `docs/test-evidence/stage-0/security.md`, `docs/test-evidence/stage-0/recovery.md`, `docs/test-evidence/stage-0/performance.md`, `docs/test-evidence/stage-0/known-issues.md`, `docs/test-evidence/stage-0/license-report.json`, `docs/test-evidence/stage-0/sbom.cdx.json`。
**Modify:** `package.json`, `.github/workflows/stage-0.yml`, `docs/test-evidence/stage-0/dependency-review.md`。

**Tests:** `tests/engineering/pipeline.test.ts`，并聚合 Task 0.1～0.16 全部测试和真实 PoC 证据。

**Produces:** 同一 commit 的 clean checkout 验证与全量 evidence；未跑/跳过硬门禁不能生成 accepted tag。

- [ ] 测流水线任何子命令非零、missing evidence、live PoC 未运行、license未核验、windows未验证时 gate 失败；不允许空测试 suite 退出 0 作为通过。
- [ ] `npm run unit -- tests/engineering/pipeline.test.ts` 先红；实现 fail-fast 与总结退出码，日志命令与 CI 一致。
- [ ] 执行下表全部正式 gate；PoC 中必要付费调用只用已授权预算和合成数据。失败修复后仅重跑受影响及最终集成，不伪造结果。
- [ ] 收集 cold/warm start、DB体积、查询/导入延迟、内存、streaming latency、Sidecar启动和backup时间。记录样本数、机器、原始结果；无官方 SLA 时形成预算提案，不凭主观“够快”通过。
- [ ] 进行权限/迁移/真源/依赖边界自审；产出与 Master §10.19 逐项映射的 acceptance.md。仅用户阶段验收后冻结 Contract V1。
- [ ] commit：`test: establish stage 0 acceptance pipeline`；tag `stage-0-foundation-accepted` 仅在用户验收后指向实际通过的 commit。没有验收就只保存 evidence，不打 accepted tag。

**Rollback:** 保留失败证据，修 gate 时不得弱化断言/删除测试/静默 skip。若验收发现缺陷，新增修复提交重验；未发布 tag 可记录作废，不把有问题的 commit 谎称 accepted。

---

## F. 验证命令规范（全部为未来执行，当前未运行）

所有命令从获批 Stage 0 worktree 根运行。package.json 必须实现这些脚本，CI 使用同样入口；报告保存 actual argv、版本、退出码。Vitest 分组由 `scripts/run-test-group.mjs` 调度，使用明确 include，不能让 unit/integration/security 指向同一个空入口。unit 仅纯逻辑，integration 包含真实I/O，security/recovery按独立目录与显式清单分组；命令行文件参数必须实际选择到测试，否则非零退出。

| 命令 | 预期职责 |
|---|---|
| `npm ci` | 锁文件 clean install，版本可复现 |
| `npm run typecheck` | TS project references 严格类型，所有 package/main/preload |
| `npm run lint` | lint 与格式验证，不自动隐藏错误 |
| `npm run unit` | Vitest 纯函数/状态/策略/provider解析测试 |
| `npm run integration` | 真实临时 SQLite/FTS5/文件/本地进程/MCP SDK/协议测试 |
| `npm run e2e-smoke` | Playwright 启动 Electron 技术窗口、IPC/security边界、基础 run/approval |
| `npm run security` | IPC/路径/权限/secret/外发/进程边界与备份拒绝矩阵 |
| `npm run recovery` | 中断/重启/迁移/副作用/backup/forget恢复 |
| `npm run check-boundaries` | 禁止依赖图/Renderer bundle泄漏/Agent直接SQL |
| `npm run check-doc-links` | 真源链接存在，未来文档标注 planned；当前阶段引用无悬空 |
| `npm run license` | registry 覆盖 lock + Python lock + 模型/资产；未审查或 E 级打包失败 |
| `npm run sbom` | 输出真实 dependency graph 的 CycloneDX JSON，含 Sidecar/native/model 清单链接 |
| `npm run poc:model` | 两种真实协议+自定义兼容配置 |
| `npm run poc:mcp` | 真实 SDK server/client handshake/list/call/disconnect |
| `npm run poc:native` | 简单 AI 四项，LangGraph 缺席仍运行 |
| `npm run poc:langgraph` | 真实 LangGraph interrupt/resume/checkpoint/crash |
| `npm run poc:knowledge` | 本地 Markdown+FTS5+Memory admission/forget |
| `npm run poc:sidecars -- --all` | 真实 OCR/STT/Document 三引擎 |
| `npm run poc:recovery` | 真实临时数据 backup/restore 与失败注入 |
| `npm run package-windows` | 门禁后 Forge make，native/sidecar资源入包 |
| `npm run verify:windows-package` | 干净 Windows 安装/运行/卸载/升级回滚证据 |
| `npm run stage-0:gate` | 聚合上述结果和证据，一项硬门禁缺失即失败 |

最终运行顺序：ci → typecheck/lint/unit → integration/security/recovery/check-boundaries → e2e → license/sbom → 已授权真实 PoCs → package → installed验证 → stage-0:gate。并行仅限无共享 fixture/数据的普通测试，当前计划不授权并行 Agent 开发。

Vitest 最小边界断言约定：

```ts
expect(result).toMatchObject({ ok: false, error: { code: 'DENIED' } });
expect(actualSideEffects).toEqual([]);
expect(recordsAfterRestart).toEqual(recordsBeforeShutdown);
```

这些变量由各测试显式安排真实临时资源/spy计数，不能以硬编码成功值替代调用。安全测试须同时断言“拒绝结果”和“没有副作用”。

## G. Git checkpoint 与回滚运行手册

每任务在通过相关 gate 后执行：`git status --short` → `git diff --check` → `git diff -- <本任务确切文件>` → 精确 `git add` → `git commit -m`（上文消息）。不要暂存其他人的文件，不推送远端。提交后把 SHA 写入对应 task evidence，evidence 可在紧随的 docs checkpoint 收录，避免把本提交 SHA 自引用进同一提交。

例：Task 0.5 只暂存本任务文件和 permission matrix/evidence，不能 `git add packages` 顺带收入其他改动。每个 checkpoint 可独立 review。测试或授权阻塞时保留未完成状态，不为了 checkpoint 伪造通过。

通用代码回滚：先 `git status`/保存未提交用户工作→识别实际任务 commit→`git revert <已核实SHA>`→运行该任务及相关回归。不得 `reset --hard`、`clean -fdx` 或整目录递归删除。SHA 必须现场核验，不使用虚构值。

数据回滚不同于代码回滚：停写→创建当前快照→验证目标 backup/schema/app兼容→恢复临时位置→integrity/hash/security/Forget tombstone验证→切换。外部副作用不可用 Git revert 撤销；保留 effect receipt，使用已授权补偿操作或标记人工核对。不能承诺任意 MCP/API 操作可回滚。

空仓库规划 baseline 之前没有可回退 commit，本次文档也尚未提交；初始化时先建审阅过的 docs baseline，后面才建立隔离开发 worktree。

## H. Stage 0 Acceptance Criteria

所有 checkbox 当前未通过。必须有真实证据；用户 Stage 0 验收不会被脚本替代。

- [ ] A 门禁问题已记录决定，Stage 0 spec/design/data model/permission matrix 已批准；四份真源明确 0→0.5→1。
- [ ] Task 0.1：clean checkout、strict TS/lint/test/最小 Electron 窗口；六个必需 ADR 和第三方 registry 可审阅。
- [ ] Task 0.2：跨域最小 Contract V1 冻结，无 Electron/LangGraph/SQL 依赖泄漏；没有后续业务实现。
- [ ] Task 0.3：empty/old→latest、checksum/FK/UNIQUE、事务/迁移中断/重启通过；失败停止写入。
- [ ] Task 0.4：业务和事件同事务；重放/投影重建/幂等；Domain/Agent Event 分离。
- [ ] Task 0.5：权限/审批有效、临时撤销、HIGH确认、范围扩大重新决策、审批不可重放；硬保护不能审批解除。
- [ ] Task 0.6：Renderer 无 Node/fs/SQLite/shell/credentials，typed IPC白名单/调用者/参数/归属校验通过。
- [ ] Task 0.7：Managed Copy独立、Git/Vault真源不复制；Windows traversal/link/竞争/跨工作区/源码安装更新器保护测试通过。
- [ ] Task 0.8：两种协议形态及自定义兼容配置真实调用；routing/cancel/capabilities/secret/budget/fallback外发规则通过。
- [ ] Task 0.9：内部/文件/固定CLI/Git/API/高风险测试工具与MCP真实互通；失败/超时/取消/断线可见；未开放任意进程绕过权限。
- [ ] Task 0.10：十个Runtime方法、合法状态、终态不变、stream/授权/快照重建/任务结束撤权通过。
- [ ] Task 0.11：没有LangGraph安装依赖时 Native 和 Core仍可运行，四类简单操作提供真实证据。
- [ ] Task 0.12：真实LangGraph run/stream/interrupt/approval pause/resume/checkpoint/failure recovery通过；副作用不重复；不持有业务真源。
- [ ] Task 0.13：Markdown/Obsidian唯一正文、FTS5+引用可重建；Memory非自动接纳、有证据/授权/scope；Forget影响索引和批准范围的私有备份。
- [ ] Task 0.14：OCR/Speech/Document实际引擎PoC均通过，取消/健康/版本/超时/进程树/crash不影响Main。
- [ ] Task 0.15：日志脱敏、30天回收元数据、无敏感普通备份、完整manifest、staging restore、损坏备份拒绝、Forget不复活。
- [ ] Task 0.16：真实干净Windows安装/启动/SQLite native/sidecar/卸载/升级/回滚证明；无正式自动更新实施。
- [ ] Task 0.17：全部门禁实际执行，License/SBOM包括模型数据资产与Sidecar；性能测量/已知问题/安全/恢复/验收报告完成。
- [ ] 无07开发区、Stage6、完整业务页面、未确认生产依赖、自我开发工具或受保护路径放行；ZIP未作为自动生成业务的授权来源。
- [ ] 用户验收Stage 0，才可创建 `stage-0-foundation-accepted` 并申请Stage 0.5；Design System/核心原型获批前不进入Stage 1。

## I. 风险与停止条件

| 风险 | 检测证据 | 处理/门禁 |
|---|---|---|
| C1/C3/C4/C5尚无决定 | 审阅报告与用户决定 | 继续独立文档准备，不执行依赖该决定的实现 |
| SQLite ABI/FTS5/打包失败 | Task0.3/0.16真实Windows | 更换binding需ADR/许可审阅，不能放宽安全 |
| LangGraph checkpoint副作用重复 | Task0.12三处崩溃注入 | receipt/幂等边界；UNKNOWN暂停核对 |
| Path检查≠OS进程沙箱 | Task0.7/0.9/0.14 | 不可信任意代码不可用，固定受控fixture不足以声称通用沙箱 |
| Provider成本/敏感外发 | Task0.8 | 无预算/凭据/授权则BLOCKED，不能隐式fallback |
| Personal Core/备份恢复泄漏 | Task0.13/0.15 | 私有store隔离、allowlist、Forget restore验证 |
| Sidecar体积/模型许可/Windows缺失 | Task0.14/0.16 | 记录真实阻塞，不能用Mock过关 |
| 把Stage0做成全产品 | diff/包依赖检查 | 只做基础Contract与PoC；未来领域/完整UI留到对应阶段 |

## J. 本次计划自审与执行交接

覆盖映射：Master 0.1～0.17全部对应上述同号任务。用户另点名MCP为Task0.9，Native为0.11，Backup/Diagnostic为0.15，Windows为0.16。规格额外Git/Local/API PoC已明确列入0.9；无LangGraph安装验证在0.11/0.12；安全硬拒绝前移0.5/0.7，不能等Stage5再保护自身。

当前仅文档产物，未运行本文任何安装、测试、构建、PoC、提交或tag命令。详细计划中的技术提案不表示已批准；最终版本/物理schema/依赖与外部PoC配置必须在执行前门禁按证据确认。

下一步是用户审阅问题清单及本计划；只有明确“确认，开始开发 Stage 0”后才进入已批准范围的实现。确认开始不意味着自动通过Stage0、自动进入0.5或Stage1。


