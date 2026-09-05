# UniForge V2.1 真源审阅与仓库检查

日期：2026-09-05。范围：四份用户指定真源全文、当前仓库；不含 UI ZIP 的设计审查。
本报告提出问题与修改建议，不修改或批准上位架构。当前用户仅授权文档审查和 Stage 0 计划准备。

## 1. 当前项目理解

UniForge 是面向大学生的 Windows 优先、本地优先、对象中心、证据优先的 AI 桌面工作台。课程、项目、任务、成果、来源和记忆是持久对象，聊天是操作方式之一。

导航实际列出七个入口：00 总览，以及六个工作模块 01 Agent 执行中心、02 课内学习、03 英语备考、04 项目实践、05 知识与情报、06 AI 新闻。“总览 + 六个模块”是建议统一的措辞，尚未改写 README。

依赖关系：App Shell → Domain Modules → Application Services → 自主 Core；Agent、Knowledge、Model、Tool 平台通过自有契约提供能力；Connector/Sidecar 隔离外部能力；底层是 SQLite、文件、Git、系统凭据。箭头表示调用/编排，不表示平台获得业务所有权。

Domain Core 持有规则与业务写入口。AgentRuntime 负责执行，Native 处理简单任务，LangGraph Adapter 处理复杂长任务；框架状态不是业务状态。Model Gateway 独立管理模型、能力、路由、预算和凭据引用。Tool Gateway 统一校验工具输入输出、权限、审批和执行限制；MCP 只接外部工具。Knowledge 处理来源、关系和检索；Personal Core 通过 Evidence、Scope、Authorization 接纳长期 Memory，不能把对话自动升级为记忆。

数据真源：领域数据由 Domain Core/SQLite 管理；Content Graph 和 Vocabulary Domain 是 UniForge 的逻辑所有者，不应另立外部数据库真源。普通文件使用 Managed Copy；Git 历史归 Git；Obsidian 正式正文归所选 Vault 的 Markdown；个人记忆归 Personal Core；Agent 历史归 UniForge Agent Event Store；密钥归 Windows 安全凭据存储。索引、缓存、Projection 可重建。运行 checkpoint 不能取代领域事实，但删除它可能损失恢复能力，见 G2。

正式写路径：Proposal/typed Command → Permission → 必要的 Approval → Domain Service → Transaction → Domain Event → Projection/UI。LOW 按策略；MEDIUM 显式策略；HIGH 确认。任务结束收回临时权限；范围、供应商敏感数据外发、预算扩大需要新决策。保护路径是硬拒绝，Approval 无权解除。

Renderer 只展示；Preload 只提供最小 typed API；Main 的可信服务重新验证 channel、payload、调用者和权限，并协调存储、凭据及受控进程。不能把 Renderer 传来的 runId、actor 或 approvalId 当授权证明。

路线严格为 Stage 0 架构 → Stage 0.5 设计系统/原型审批 → Stage 1 桌面及课程 → Stage 2 英语 → Stage 3 知识情报 → Stage 4 AI 新闻 → Stage 5 项目实践。当前仅准备 Stage 0。Stage 0.5 可设计未来页面，但不实现未来业务。

第三方等级：A 直接集成；B Runtime/Sidecar；C 外部连接器；D 产品/架构参考；E 禁止采用。LangGraph 的 A/B 表述需细化；Bok 为 D 参考及可选 B PoC；Boujoy Harness、Research Workbench、ielts-workbench 仅参考。代码、数据、模型、音频和资产许可证分别审查。

永久禁止：07 开发区、应用内修改 UniForge 源码/安装目录/更新器/核心 Migration/权限内核/构建签名逻辑、用审批解除上述保护、Agent 直写领域表、Renderer 获得任意 fs/shell/IPC、第二正式数据真源、伪造成功、未经授权再分发资料。阶段性禁止：当前业务代码和完整 UI、Stage 1～5、正式微信抖音连接器、完整 IDE、Level 4 Sandbox、多用户协作、macOS 正式版、插件商店、正式自动更新设施、第二生产 Runtime、高级 Wake Word 训练。

## 2. 四份真源关系

执行优先级：本次用户明确指令 → 根 AGENTS.md → 产品架构规格 → 已批准当前阶段规格/计划（Master Plan 提供路线）→ ADR/Domain Contract → 现有实现。README 是介绍与导航，不凌驾架构。

AGENTS 是仓库执行规范，用户已明确指定遵循；文档内出现的“实现、安装、提交”是未来工作要求，并不构成本次开始编码、安装或 Git 提交的授权。

四份原件均从 Downloads 原样复制到约定路径，未修改正文。AGENTS(2)(1).md 映射为根 AGENTS.md。用户指定它们为当前真源，不等于解决了下述文本内部不一致。

## 3. 问题 → 所在文件 → 风险 → 建议修改方式

下列编号用于 Stage 0 计划的执行门禁。所有修改均等待用户确认。

| ID / 性质 | 问题与位置 | 风险 | 建议修改方式 |
|---|---|---|---|
| C1 明确门禁缺漏 | 规格 §24、§33（约 L1793、L2230）完全没有 Stage 0.5；§33 写 Stage 0 后进入 Stage 1。Master §10.19 L1398 也保留“全部满足才允许进入阶段1”，而 §1、§10.20、§29 和 AGENTS L44 要求先过 0.5 | 单独读上位规格可能跳过设计审批 | 在规格 §24、§33 补入 0.5；Master §10.19 改为“仅可申请进入 Stage 0.5；Stage 1 还须设计审批”。本次直接遵循用户指定完整顺序 |
| C2 数量错误 | README L118 说“六个一级工作区”，随后列 00～06 七项；规格 §4.1 也列七项但不声明六个 | 导航漏项、验收计数错误 | 统一为“总览 + 六个工作模块，共七个一级入口” |
| C3 与本次指令边界需澄清 | 规格 §3.8 L365 允许授权课程代码/项目工作区；§9.5 允许课程编译运行测试调试；Master 开头 L7、§11.10 对应课程代码执行；本次要求软件开发能力只能位于项目实践 | 把课程临时执行扩成源码编辑或独立开发入口 | 建议课程只允许临时沙箱执行和输出，持久源码修改、Git、IDE 均转到 04 软件项目。用户确认前不实现课程写入能力；当前 Stage 0 只做合成 fixture |
| C4 风险规则歧义 | 规格 §22.1 L1757 将“修改数据库”列 HIGH，但同节“创建任务”是 MEDIUM；AGENTS “Enforce least privilege”将正常 Domain Command 以外的数据库修改列高风险，README 写“高风险数据库修改” | 每次普通领域命令都重复审批，或反向放开直写数据库 | 明确按语义动作分级；正常 typed Command 不因底层 SQL 自动升 HIGH；破坏性维护仅可信应用外维护流程，Agent 仍不得直写领域表 |
| C5 备份排除不一致 | Master §10.16 L1336 排除 raw chat；§21.2 L3715 写 raw chat login state（含义不同）；§21.1 又泛称 SQLite domain data | 原始对话/个人记忆意外进入普通备份；Forget 后恢复导致复活 | 列出实体/字段级 allowlist；明确原始聊天、登录状态、Personal Core 的普通/私有备份策略与 Forget tombstone 恢复规则；确认前不采集真实私人数据 |
| C6 上位文档自包含不足 | 规格 §9“保留原有完整功能”、§13“保持原设计”、§23“保持原方案”；未提供对应旧版本；文档头仍是“完整方案草案” | Agent 根据不存在的旧文档臆造需求，或把草案当已冻结 Schema | 标明本次认可的 V2.1 状态；删除不可解析历史依赖或改成当前具体章节引用，未列细节由后续阶段规格批准 |
| C7 采用级别未冻结 | 规格 §7.3 L605、Master §4 写 LangGraph A/B；规格 §18.2 又列 B；Bok 最终复用范围也在 §31 待确认 | 未审查即成为核心/生产依赖 | ADR-0005 固化应用边界为可替换 Adapter、治理等级 B；SDK 自身包记录 A 或 B 的具体解释。Bok 默认仅参考，代码复用另审查。不得把这一建议当已批准 |
| C8 顺序图易误读 | Master §16 将 Stage 2 与 Stage 3 画成分支，正文仅说正式实施“仍建议”顺序 | 被理解为可并行跳阶段 | 将“数据依赖图”与“执行门禁”分开；执行门禁明确必须 2→3，保持用户指定顺序 |

以下是实施缺口/待定设计，不是已发现的冲突或现有漏洞：

| ID | 缺口与位置 | 风险 | 建议修改方式 |
|---|---|---|---|
| G1 真源物理映射 | Master §10.4 agent_runs + agent_events、规格 §20 Agent Run 真源；Personal Core §31 Schema 待确认 | 两表独立更新成为双真源；个人记忆混入通用 DB/导出 | 提案：AgentEvent 是权威历史，agent_runs 为同事务可重建快照；Personal Core 隔离私有 SQLite，仅在临时 PoC 验证；提交 ADR 和 Schema 后确认 |
| G2 checkpoint 恢复语义 | README/AGENTS 将 runtime checkpoints 统称可重建派生状态；Master 要求安全 checkpoint 恢复 | 清缓存时误删恢复点，或重放外部写产生重复副作用 | 明确 checkpoint 非领域真源但可包含无法仅凭日志重建的执行游标；缺失则安全暂停/从幂等边界重启，不能保证任意精确恢复；独立保留策略 |
| G3 进程与外部工具隔离 | Master §10.8 路径校验、§10.10 CLI/MCP、§15.10 后置完整 Sandbox | cwd 不是安全沙箱，MCP/CLI/Sidecar 子进程可绕过网关直接写保护目录 | Stage 0 限自有受控 fixture/固定二进制、能力最小化；对不可信任意代码无有效 OS 隔离则不启动。提前测试保护路径不可通过子进程绕过；Stage 5 才做完整 IDE/Sandbox |
| G4 备份可恢复内容 | Master §21.1 只显式列 managed workspace metadata | 源文件删掉后只恢复元数据，无法恢复唯一 Managed Copy | 提案：普通备份纳入允许范围的 managed 文件及哈希；缺失 payload 必须拒绝“完整恢复”。外部 Git/Vault 不复制成新真源 |
| G5 权限实现细节 | Master §10.6/10.7 仅列 scope 与 IPC 参数验证 | 伪造 actor、重用审批、路径检查后替换链接 | 将身份绑定、审批绑定 command/tool/version/payload/scope/expiry、执行前重验、路径竞争写入 Stage 0 安全矩阵 |

### 未发现的问题

没有仍被授权实现的旧 DeepSeek Harness 底层。DeepSeek 可作为 Model Provider，与 Harness 无关。Boujoy Harness 明确仅 D 参考。07 开发区的命中均是禁止/取消/检查文字；Stage 6 Developer Runtime 仅作为已取消历史出现。没有发现明确授权 Agent 修改 UniForge 本体的流程；G3/G5 是必须用实现证据封闭的绕过风险。

没有发现要求同时维护两份 Content 正文或独立考试词汇状态的设计。Personal Core/Content Graph 属逻辑归属；物理存储尚需 G1 决策。ProjectTask（Master §15.2）应作为 Unified Task 的项目投影/关系，不应另建独立任务真源，依据 Master §17.1。

### 文件引用

四份真源引用的 spec/master 路径拼写相互一致。初始仓库没有这些文件，现已原样放入。README 中 design 文档、registry，以及 Master 中 ADR、代码、测试路径都是未来产物，目前缺失符合空仓库状态，不能声称已存在。规格中的历史“原方案”没有可解析目标，归 C6。仓库显示名是 New project，不是 uniforge；相对路径不受影响，本次不移动或重命名仓库。

## 4. 当前仓库状态

检查工作目录：C:/Users/Tong/Documents/ChatGPT/New project。
初始根目录只有 .git；git status 为 No commits yet on master；git ls-files 为空；git log 返回尚无提交；git remote -v 无输出。没有 package.json、锁文件、源码、测试、CI、现有架构或依赖可比较。没有对旧代码迁就规格的需要。检查过上级目录，未发现额外 AGENTS.md。

本次仅新增四份真源副本、本报告、Stage 0 计划，共六份 Markdown。未安装依赖、未初始化业务包、未生成锁文件、未建分支/worktree、未 commit/tag/push。Git 已初始化，不应重复 git init。ZIP 存在但未解压/运行，既不是真源之一，也不在当前 UI 阶段范围。

## 5. 建议 Stage 0 实施结构

按 Master Task 0.1～0.17 串行检查点：治理/工程 → Domain Contracts → SQLite/Migration → Event/Projection → Permission/Approval → Electron IPC → Workspace → Model → Tool/MCP → Runtime Contract → Native → LangGraph → Knowledge/Memory → Sidecars → 诊断回收备份 → Windows Build → 全流水线验收。

详细计划：../superpowers/plans/2026-09-05-stage-0-architecture-foundation.md。
跨阶段对象现在仅定义最小 ID/关系契约，不建立课程/英语/新闻业务服务和完整表。

## 6. 文件范围

本次新增：AGENTS.md、README.md、docs/specs/2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md、docs/superpowers/plans/2026-09-05-uniforge-v2.1-complete-development-plan-with-ui.md、docs/architecture/2026-09-05-source-review.md、docs/superpowers/plans/2026-09-05-stage-0-architecture-foundation.md。
建议后续修改 C1～C8 涉及的原文，当前一字未改。正式开发拟创建的每个模块/文件、测试、命令和回滚方式列于详细计划。

## 7. Stage 0 风险

主要风险是 Electron/SQLite ABI 与 Windows 打包、审批重放/路径竞争、任意子进程越界、框架 checkpoint 重放产生重复副作用、个人记忆备份泄漏、模型敏感数据 fallback、Sidecar 模型体积及许可证、仅有 Mock 而缺真实 PoC。详细计划把真实验证与合成测试分开；阻塞项未解决则不验收。

## 8. 下一步

先确认 C1～C8 的修改方向以及 G1～G5 的 Stage 0 提案，再修订相关真源/ADR。当前详细计划是可审阅的执行草案，不是已批准架构。
只有用户明确回复“确认，开始开发 Stage 0”才进入编码。该回复不自动解决未选择的架构冲突、不自动批准未核验的生产依赖或付费外发；先完成相关决策及版本/许可登记。Stage 0 验收后仍只可申请 Stage 0.5，不能直达 Stage 1。

## 后续状态：用户已确认
2026-09-05 用户同意本报告修改建议并授权 Stage0 实施。本文上文保留初审历史，C1～C8/G1～G5已纳入规格§35与Stage0文档；验证状态另见任务证据。本体保护和后续阶段门禁不变。
