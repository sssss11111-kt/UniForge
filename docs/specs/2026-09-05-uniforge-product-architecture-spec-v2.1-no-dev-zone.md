# UniForge 产品与架构设计规格 V2.1

- 文档状态：架构重构版完整方案草案
- 初始设计日期：2026-08-30
- 本次重构日期：2026-09-05
- 项目目录：`uniforge`
- 中文名：暂不设置
- 目标平台：Windows 优先
- 架构版本：V2.1
- 核心变化：取消 DeepSeek Harness 的底层架构与核心参考地位，采用 UniForge 自主领域内核与可替换 Agent Runtime；取消应用内“开发区/自我开发”能力，UniForge 本体源码不向应用内 Agent 开放写权限

---

## 1. 文档目的

本文固化 UniForge 当前确认的产品目标、模块边界、核心数据关系、AI 与 Agent 行为、知识与长期记忆、隐私权限、技术架构、开源项目采用策略、阶段范围及验收标准。

本文是后续阶段规格和实施计划的上位依据。

本文不直接授权：

- 编写业务代码；
- 安装第三方依赖；
- 修改用户真实数据；
- 发布正式软件；
- 启用未经验证的连接器；
- 将实验性 Agent 框架绑定为不可替换的核心依赖。

UniForge 规模较大，禁止以一个实施计划整体开发。

后续必须按照本文的阶段顺序，为当前阶段分别建立：

1. 阶段规格；
2. 技术方案；
3. 数据模型；
4. 权限矩阵；
5. 实施计划；
6. 测试方案；
7. 验收证据；
8. Git 检查点；
9. 失败与回滚策略。

---

# 2. 产品定义

## 2.1 UniForge 是什么

UniForge 是面向大学生的本地优先 AI 桌面工作台。

它将以下原本分散的场景放入统一工作系统：

- 课内学习；
- 英语备考；
- 竞赛；
- 科研；
- 软件项目；
- 课程设计；
- 个人知识库；
- 微信、抖音等来源中的零散信息；
- AI 新闻；
- Agent 自动化；
- 软件项目开发（归入项目实践）。

UniForge 的核心价值不是提供一个更大的聊天框。

它要解决的问题是：

> 让课程、考试、项目、知识、任务、来源、记忆、Agent 和成果成为长期存在的真实对象，让 AI 在明确上下文、明确权限和可追踪证据下持续工作。

---

## 2.2 目标用户

主要用户包括：

- 同时管理多门课程、作业、考试和学习资料的大学生；
- 参加电子设计竞赛、数学建模、科研训练等项目的学生；
- 开发个人软件、课程项目或开源项目的学生；
- 使用 Obsidian 等工具维护个人知识库的用户；
- 希望整理微信群、抖音会话、网页、截图等信息的用户；
- 正在准备四级、六级、雅思等英语考试的用户；
- 希望 AI 不只是回答问题，而是能够参与长期项目的用户；
- 希望借助 AI 完成课程、项目、知识整理和软件项目开发，但不具备完整软件工程能力的用户。

---

## 2.3 设计初衷

大学生日常的信息和任务天然分散：

- 课表和教学大纲在一个地方；
- 课程文件在文件夹；
- 作业在微信群；
- 考试日期可能只存在老师发的图片中；
- 项目代码在 Git；
- 决策在聊天记录；
- 竞赛资料在群聊；
- 英语单词存在多个 App；
- 知识笔记又在 Obsidian；
- AI 对话分散在不同平台和不同会话；
- 有价值的信息经常用完即丢。

普通 AI 工具通常只看到一次对话。

它不知道：

- 这是哪门课；
- 属于哪个考试；
- 属于哪个项目；
- 文件是什么版本；
- 用户以前做过什么决定；
- 某项任务是否已经完成；
- 某条信息是否已经进入知识库；
- 一个 Agent 是否有权修改某个文件；
- 某个结论来自哪里。

UniForge 的目标是：

> 把 AI 从一次性问答工具转变为可持续运行的个人学习与工作系统。

---

# 3. 核心架构理念

## 3.1 UniForge 不再建立在任何单一 Agent 框架之上

V2 的核心架构原则是：

> UniForge 本身就是平台。

任何 Agent Framework、Workflow Framework、Memory Framework 或第三方 Agent 实现都只是可替换能力。

禁止形成：

```text
UniForge
    ↓
某 Agent Framework
    ↓
所有业务
```

正式架构应为：

```text
                 UniForge
                    │
        ┌───────────┴───────────┐
        │                       │
   Domain Core             Application Layer
        │                       │
        └───────────┬───────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
 Agent Platform Knowledge   Tool Platform
       │            │            │
       ▼            ▼            ▼
 Runtime Adapter  Memory     MCP / API / CLI
```

因此未来即使：

- LangGraph 发生重大变化；
- Mastra 被替换；
- MCP 协议升级；

UniForge 的：

- 课程；
- 项目；
- 英语；
- 知识；
- 任务；
- 权限；
- 数据；
- UI；

都不需要重构。

---

## 3.2 以对象为中心，而不是以聊天为中心

核心长期对象包括：

```text
Workspace
Course
ExamSpace
Project
Task
ContentEntity
SourceEvent
Topic
VocabularyEntry
LearningEvent
NewsEvent
AgentDefinition
AgentRun
Workflow
Approval
Artifact
MemoryClaim
Decision
```

聊天只是：

> 操作这些对象的一种界面。

---

## 3.3 一个对象、一个真源、多个视图

例如一条微信群消息：

```text
ContentEntity #1783
```

可以同时出现在：

- 情报收件箱；
- 微信来源；
- 待整理；
- 电赛主题；
- 电赛项目；
- AI 新闻关联；
- Obsidian 待写入。

但系统中不能存在六份独立正文。

而应该：

```text
ContentEntity
     │
     ├ Relation → Inbox
     ├ Relation → WeChat
     ├ Relation → Topic
     ├ Relation → Project
     └ Relation → ObsidianNote
```

这样用户在任何入口：

- 归纳；
- 标记完成；
- 删除；
- 修改状态；

其他入口都会同步变化。

---

## 3.4 AI 不能拥有业务数据

Agent 不允许直接成为数据库所有者。

禁止：

```text
CourseAgent
   ↓
UPDATE courses
```

正式流程：

```text
CourseAgent
     ↓
Proposal / DomainCommand
     ↓
Permission Check
     ↓
Approval
     ↓
Course Service
     ↓
Transaction
     ↓
Domain Event
```

因此：

> Agent 可以建议、计划和执行，但不能绕过 UniForge Domain Core。

---

## 3.5 本地优先不等于拒绝云端

默认：

- 私人文件留在本机；
- 聊天原文留在本机；
- 用户画像留在本机；
- API 凭据留在系统安全凭据中；
- Local Memory 留在本机；
- 搜索索引留在本机。

用户可以主动选择：

- OpenAI；
- Anthropic；
- Gemini；
- DeepSeek；
- Qwen；
- Ollama；
- OpenAI Compatible；
- 自定义 API；
- 本地语音模型；
- 云语音模型。

任何敏感数据准备离开本机时，应明确显示发送范围。

---

## 3.6 渐进式自动化

自动化能力按照：

```text
AI 建议
↓
用户采纳
↓
重复使用
↓
形成规则
↓
低风险自动执行
```

演进。

高风险能力不能因为用户以前批准过类似操作而无限获得权限。

---

## 3.7 来源与证据优先

以下内容必须可以追溯：

- AI 总结；
- 学习建议；
- 掌握度；
- 新闻结论；
- 项目建议；
- 长期记忆；
- Agent 决策；
- 代码修改；
- 测试结果；
- 发布声明。

---

## 3.8 稳定内核禁止应用内自我修改

UniForge 不在产品内部提供修改 UniForge 本体源码、数据库迁移代码、权限内核、更新机制或安装包构建逻辑的“自我开发”能力。

应用内 Agent 的最高开发权限仅作用于用户明确授权的课程代码或项目工作区。

明确禁止：

```text
UniForge App Agent
    ↓
修改 UniForge 自身源码 / 安装目录 / 更新器
```

UniForge 本体的版本升级、架构重构和源码开发必须在应用外，通过正常软件工程流程完成：

```text
外部源码仓库
↓
需求与规格
↓
独立分支 / worktree
↓
开发与测试
↓
代码审查
↓
构建与签名
↓
发布新版本
```

应用本身只负责检测、下载和安装经过验证的正式更新，不允许运行中的 UniForge 自行改写其稳定内核。

---

# 4. 产品外壳与导航

## 4.1 一级入口

保留：

```text
00 总览
01 Agent 执行中心
02 课内学习
03 英语备考
04 项目实践
05 知识与情报
06 AI 新闻
```

左下角提供：

- 设置；
- 模型中心；
- 权限与隐私；
- 工作区；
- 连接器；
- 关于与诊断。

---

## 4.2 通用布局

默认使用模块化桌面布局：

```text
┌──────────┬─────────────┬────────────────────┬────────────┐
│ 一级导航 │ 二级导航     │ 主工作区            │ 状态侧栏   │
│          │             │                    │            │
│          │             │                    │            │
│          │             │                    │            │
├──────────┴─────────────┴────────────────────┴────────────┤
│ Agent 输入 / 附件 / 模式 / 模型                         │
└─────────────────────────────────────────────────────────┘
```

左上角提供全局语音。

---

# 5. 00 总览

总览只回答：

> 我现在最应该做什么？

不承担复杂编辑。

核心卡片：

- 今日焦点；
- 快速开始；
- 课程与考试；
- 英语备考；
- 项目动态；
- 情报与新闻；
- Agent 与审批；
- 最近空间。

今日焦点优先级：

1. 用户置顶；
2. 明确截止日期；
3. 已确认计划；
4. AI 风险建议；
5. 普通推荐。

AI 必须说明：

> 为什么推荐这件事。

---

# 6. 01 Agent 执行中心

Agent 执行中心管理：

- 多步骤任务；
- 长任务；
- Agent 协作；
- 跨模块任务；
- Workflow；
- 审批；
- 产物；
- 回放。

## 6.1 二级入口

| 入口 | 功能 |
|---|---|
| 新建任务 | 创建任务并确认目标、权限、预算和验收标准 |
| 执行现场 | 查看当前计划、步骤、Agent、工具和文件变化 |
| 任务队列 | 管理运行、等待、暂停、失败和完成任务 |
| Agent 团队 | 查看当前任务动态 Agent |
| 工作流 | 管理可复用 Workflow |
| 定时任务 | 管理计划执行任务 |
| 审批中心 | 统一处理权限请求 |
| 产物中心 | 查看报告、代码、笔记等产物 |
| 运行回放 | 查看完整执行时间线 |

---

# 7. Agent Platform

这是 V2 的重点重构部分。

## 7.1 UniForge Agent Contract

UniForge 自定义稳定 Agent 接口。

概念结构：

```text
AgentDefinition
├ id
├ role
├ domain
├ modelPolicy
├ promptVersion
├ contextPolicy
├ toolPolicy
├ permissionPolicy
├ budgetPolicy
└ outputSchema
```

Agent 运行：

```text
AgentRun
├ status
├ task
├ context
├ steps
├ toolCalls
├ approvals
├ events
├ checkpoints
├ costs
└ artifacts
```

---

## 7.2 Agent Runtime Contract

运行时必须实现统一接口，例如：

```text
createRun
start
stream
pause
resume
cancel
interrupt
checkpoint
fork
inspect
```

UniForge 不允许业务代码直接依赖某个框架特有对象。

例如：

```text
CourseService
```

不能依赖：

```text
LangGraph.StateGraph
```

只能依赖：

```text
AgentRuntime
```

---

## 7.3 LangGraph.js

LangGraph.js 作为首选复杂 Agent Runtime 候选。

主要负责：

- 长任务；
- Stateful Workflow；
- 分支；
- 循环；
- Interrupt；
- Human-in-the-loop；
- Checkpoint；
- Resume；
- Fault Recovery；
- Agent Graph。

采用级别：

> A/B：Agent Runtime Adapter。

但必须保证：

```text
LangGraph State
≠
UniForge Domain State
```

LangGraph checkpoint 是执行状态。

SQLite 中的 UniForge Domain Data 才是业务真源。

---

## 7.4 Mastra

Mastra 作为第二 Runtime 技术储备。

主要研究：

- Agent；
- Workflow；
- Tools；
- MCP；
- Observability；
- Memory；
- TypeScript 生态。

首阶段禁止同时维护两套生产 Runtime。

因此：

```text
Production:
LangGraph Adapter

Experiment:
Mastra Adapter
```

只有 LangGraph 出现明显不适配时再进行替换决策。

---

## 7.5 Native Runtime

简单 Agent 操作不需要全部进入 LangGraph。

例如：

```text
解释一个 PDF 段落
生成 5 道练习题
给文章生成摘要
解释一个单词
```

可直接：

```text
Domain Service
↓
Model Gateway
↓
Tool Gateway
```

复杂任务才进入：

```text
Agent Runtime
```

避免过度工程化。

---

# 8. Agent Context 与长期记忆

V2 将：

```text
Conversation Context
```

与：

```text
Long-Term Memory
```

严格分离。

## 8.1 Context 类型

至少包括：

```text
Task Context
Domain Context
Project Context
Course Context
Knowledge Context
Personal Context
Runtime Context
```

---

## 8.2 Conversation 不自动等于 Memory

一次对话默认只是：

```text
Conversation
```

只有经过价值判断才形成：

```text
Memory Candidate
```

再经过：

- 来源；
- 证据；
- 冲突；
- 风险；
- 用户授权；

才能成为长期记忆。

---

## 8.3 Bok 参考方案

Bok 作为 UniForge Knowledge/Memory 架构的重要参考。

UniForge 借鉴：

```text
Conversation
↓
Receipt
↓
Evidence
↓
Memory Candidate
↓
Memory Claim
↓
Outcome
```

以及：

- provenance；
- version；
- forget；
- local-first；
- minimal cited context；
- 可删除索引；
- 混合检索；
- 原子写入；
- 备份恢复。

UniForge 不直接把整个 Bok 变成知识模块。

---

## 8.4 Personal Core

建立独立个人记忆层。

例如：

```text
PersonalClaim
├ claim
├ evidence[]
├ confidence
├ scope
├ source
├ createdAt
├ reviewedAt
├ authorization
├ impact[]
└ outcome[]
```

Personal Core 不进入：

- Git 项目；
- 课程文件目录；
- Obsidian 公共 Vault；
- 导出项目包。

---

# 9. 02 课内学习

保留原有完整功能。

## 9.1 二级入口

- 学期总览；
- 课程空间；
- 作业中心；
- 考试与复习；
- 学习资料；
- 学习记录；
- 课程档案。

## 9.2 课程空间

课程支持：

- 手动创建；
- 教学大纲导入；
- 课表截图识别；
- PDF 导入；
- 教师资料识别。

AI 提取：

- 课程；
- 章节；
- 作业；
- 考试；
- 截止时间。

必须先展示证据再正式写入。

## 9.3 课程 AI

每门课程拥有一个前台 Course AI。

后台 Agent 动态生成：

```text
Course AI
├ Explanation Agent
├ Search Agent
├ Exercise Agent
├ Code Agent
└ Review Planner
```

不预先创建大量永久 Agent。

## 9.4 作业

支持：

- 辅导；
- 协作；
- 任务执行。

默认协作。

系统不得自动提交作业。

## 9.5 代码课程

经授权后可以：

- 编译；
- 运行；
- 测试；
- 调试。

代码执行权限与 Agent 操作真实项目权限必须分开。

## 9.6 掌握度

掌握度由证据生成。

包括：

- 最近练习；
- 正确率；
- 提示次数；
- 遗忘；
- 用户自评；
- 模考表现。

AI 评估可由用户修正。

---

# 10. 03 英语备考

## 10.1 一级结构

保持：

- 备考总览；
- 考试空间；
- 背单词；
- 错词与薄弱项；
- 专项训练；
- 模考与成绩；
- 资料与题库；
- 百词斩同步；
- 学习记录；
- 英语 AI。

## 10.2 Exam Space

支持：

```text
CET4
CET6
IELTS
Custom
```

以后扩展：

- TOEFL；
- 考研英语；
- 专四；
- 专八。

不同考试规则隔离。

个人词汇能力共享。

## 10.3 IELTS 工作台

IELTS 空间内部采用针对性页面：

```text
IELTS Overview
├ Plan
├ Vocabulary
├ Listening
├ Reading
├ Writing
├ Speaking
├ Mock Exam
├ Materials
└ AI Coach
```

`ielts-workbench` 可作为雅思模块信息架构和轻量工作台 UX 参考，但只作为产品原型参考，不成为技术依赖。

## 10.4 统一词汇模型

不建立：

```text
CET4Word
CET6Word
IELTSWord
```

建立：

```text
VocabularyEntry

ability
├ senses
├ pronunciations
├ phrases
├ examples
├ morphology
│
└ examRelations
   ├ CET4
   ├ CET6
   └ IELTS
```

同一单词只有一个个人学习状态。

## 10.5 词汇学习维度

分别记录：

- 认义；
- 拼写；
- 听辨；
- 发音；
- 词性；
- 词形；
- 搭配；
- 语境；
- 熟词生义。

一次错误不能简单标记为：

> “不会这个词”。

## 10.6 FSRS

使用 `ts-fsrs` 负责基础间隔重复。

UniForge 自己叠加：

- 考试日期；
- 错误类型；
- 考试重要度；
- 每日上限；
- 用户时间；
- 近期表现。

## 10.7 english-vocabulary

该仓库可以用于：

- Vocabulary Schema 研究；
- JSON/TSV/JSONL 导入测试；
- CET4/CET6 等词表格式验证。

但正式发行前必须独立核验：

- 数据来源；
- 许可证；
- 例句版权；
- 音频来源；
- 再分发权限。

不得因为仓库公开就默认可随 UniForge 商业发行。

## 10.8 IELTS 资料

`zeeklog/IELTS` 适合参考：

- Listening / Reading / Writing / Speaking 分类；
- PDF + Audio 关联；
- 在线材料浏览；
- 范文检索。

其内容不能直接成为 UniForge 内置资源；只参考其资料组织方式。

---

# 11. 04 项目实践

## 11.1 项目类型

支持：

- 竞赛；
- 科研；
- 软件；
- 课程设计；
- 自定义。

## 11.2 项目结构动态生成

所有项目至少拥有：

```text
Project Home
Tasks
Files
Project AI
Decisions
Artifacts
```

其他入口通过 Capability Blocks 动态生成。

例如：

### 软件

```text
Code
Test
Release
```

### 科研

```text
Literature
Experiment
Data
Paper
```

### 电赛

```text
Hardware
Components
Circuit
Firmware
Debug
Experiment
```

## 11.3 Research Workbench 参考

Research Workbench 的：

- 通用记录；
- Project；
- Task；
- Note；
- Data；
- File；
- Review；
- 自定义内容类型；
- 自定义字段；
- 工作区；

可作为 UniForge 项目动态能力块的重要产品参考。

不复用其数据层。

采用等级：

> D：Product / Domain Reference。

## 11.4 Project AI Preset

每个项目拥有：

```text
ProjectAIPreset
├ goals
├ successCriteria
├ constraints
├ contextScope
├ tools
├ outputFormats
├ permissions
├ memoryPolicy
└ agentPolicy
```

Preset 版本化。

每次 Agent Run 保存当时使用的版本。

## 11.5 软件项目开发能力与边界

取消独立“开发区”后，面向用户自身软件项目的开发能力统一归入 `04 项目实践`。

软件项目可按需启用：

- Monaco 代码编辑；
- 项目文件树与全文搜索；
- 受控终端；
- `simple-git` Git 操作；
- 分支与 worktree；
- 编译、测试、调试；
- Code Agent / Test Agent / Review Agent；
- 构建产物；
- Level 0～4 分级 Sandbox。

这些能力只能访问当前项目明确授权的工作副本。默认不得访问：

- UniForge 安装目录；
- UniForge 本体源码仓库；
- 其他课程或项目工作区；
- 用户未授权目录；
- 系统凭据和其他连接器私有数据。

软件项目的 Agent 可以修改用户项目源码，但不得修改 UniForge 自身源码。

---

# 12. 05 知识与情报

## 12.1 二级入口

- 情报收件箱；
- 采集来源；
- 待整理；
- 主题追踪；
- Obsidian；
- 自动化规则；
- 来源追溯。

## 12.2 Content Graph

建立：

```text
ContentEntity
Source
SourceEvent
Relation
Topic
Summary
Claim
Citation
```

统一承载：

- 微信；
- 抖音；
- 网页；
- PDF；
- 图片；
- 截图；
- RSS；
- 新闻；
- 手动输入。

## 12.3 Obsidian

Obsidian Vault 中 Markdown 是正式知识真源。

UniForge 只保存：

- 索引；
- 路径；
- ID；
- 关系；
- 缓存；
- 写入候选；
- diff。

## 12.4 UniForge 与 Bok 的关系

V2 不再尝试“重新造一个完整 Obsidian”。

同时也不直接让 Bok 变成全部知识真源。

推荐：

```text
Obsidian / Markdown
        │
        ▼
Knowledge Source
        │
        ▼
UniForge Knowledge Service
        │
 ┌──────┴──────┐
 │             │
Bok-like      Content Graph
Memory        Relations
```

---

# 13. 06 AI 新闻

保持原设计。

## 13.1 二级入口

- 今日 AI；
- 模型与产品；
- 开源雷达；
- AI 工具；
- 论文与研究；
- 国内动态；
- 主题追踪；
- 稍后阅读；
- 新闻来源。

## 13.2 新闻不是文章列表

核心实体是：

```text
NewsEvent
```

多个文章对应同一事件。

例如：

```text
NewsEvent:
某模型正式发布
│
├ Official Announcement
├ GitHub Release
├ Documentation
├ Media
└ Community Discussion
```

## 13.3 更正机制

新的事实不能覆盖旧历史。

必须：

```text
Event
├ Original Claim
├ Update
├ Correction
└ Current Summary
```

如果旧结论已经进入用户笔记：

> 提醒用户更新，但不能静默修改正式笔记。

---

# 14. Tool Platform

## 14.1 Tool Gateway

所有 Agent 工具统一通过：

```text
Tool Gateway
```

连接。

来源可以是：

```text
Internal Tool
MCP
Local CLI
HTTP API
Connector
Plugin
Project Development Tool
```

## 14.2 Tool Manifest

每个工具必须声明：

```text
id
version
capabilities
inputSchema
outputSchema
filesystemScope
networkScope
credentialScope
riskLevel
approvalPolicy
timeout
resourceLimit
license
```

## 14.3 MCP

MCP 是 UniForge 外部工具生态的重要标准接口。

但：

> MCP 不是内部领域服务之间的通信协议。

Course、Project、Task 等内部服务仍使用 UniForge 自己的 typed contract。

---

# 15. Model Gateway

模型系统完全由 UniForge 控制。

```text
Model Gateway

├ OpenAI
├ Anthropic
├ Gemini
├ DeepSeek
├ Qwen
├ Ollama
├ OpenAI Compatible
└ Custom Adapter
```

## 15.1 模型调用层级

支持：

```text
Single Run
↓
Agent Preset
↓
Course / Project
↓
Module
↓
Global
↓
Fallback
```

## 15.2 Agent Runtime 不拥有模型配置

例如 LangGraph 只能请求：

```text
modelGateway.generate()
modelGateway.stream()
modelGateway.embed()
```

不能保存 UniForge 的正式：

- API Key；
- 价格；
- 路由；
- 模型目录；
- 用户预算。

---

# 16. 桌面技术架构

## 16.1 主技术栈

保持：

- Electron；
- React；
- TypeScript；
- Node.js；
- SQLite；
- Electron Forge；
- Monaco。

## 16.2 推荐系统结构

```text
┌─────────────────────────────────────────────┐
│                  App Shell                  │
├─────────────────────────────────────────────┤
│               Domain Modules                │
│ Course / English / Project / Knowledge      │
│ News / Dashboard                            │
├─────────────────────────────────────────────┤
│              Application Layer              │
│ Task / Search / Artifact / Approval         │
├─────────────────────────────────────────────┤
│               UniForge Core                 │
│ Domain / Event / Permission / Identity      │
├─────────────────────────────────────────────┤
│ Agent │ Knowledge │ Model │ Tool Platforms  │
├─────────────────────────────────────────────┤
│ Connector Host / Sidecar Host               │
├─────────────────────────────────────────────┤
│ SQLite / File / Git / Credentials           │
└─────────────────────────────────────────────┘
```

## 16.3 Renderer

Renderer：

> 只负责 UI。

不能直接访问：

- Node；
- SQLite；
- filesystem；
- credentials；
- shell。

## 16.4 Preload

只暴露：

- 最小接口；
- 强类型；
- 参数校验；
- 权限检查。

---

# 17. Event Store 与状态同步

所有重要变化产生 Domain Event。

例如：

```text
TaskCreated
TaskCompleted
ContentImported
ContentSummarized
CourseCreated
ExamDateChanged
ProjectPresetUpdated
ApprovalGranted
ArtifactCreated
MemoryClaimAccepted
```

## 17.1 Event 与 Projection

```text
Command
↓
Domain Service
↓
Database Transaction
↓
Event
↓
Projection
↓
UI
```

## 17.2 Agent Event

另外保存 Agent Runtime Event：

```text
RunStarted
PlanCreated
StepStarted
ToolRequested
ApprovalRequested
ToolCompleted
CheckpointCreated
RunPaused
RunResumed
RunCompleted
RunFailed
```

但 Agent Event 与 Domain Event 不混为一个概念。

---

# 18. 开源项目采用方案 V2.1

## 18.1 A：直接集成

稳定、许可清晰、技术栈合适。

例如：

- Electron Forge；
- Monaco；
- simple-git；
- FullCalendar；
- ts-fsrs；
- MCP SDK；
- Vitest；
- Playwright。

## 18.2 B：Runtime / Sidecar

能力成熟但需要隔离。

例如：

- LangGraph Runtime Adapter；
- Bok 部分能力 PoC；
- sherpa-onnx；
- whisper.cpp；
- PaddleOCR；
- Docling；

## 18.3 C：外部连接器

- 微信；
- 抖音；
- Anki；
- RSSHub；
- 外部 Obsidian 插件；
- 其他受平台限制服务。

## 18.4 D：产品与架构参考

### Bok

重点：

- Local-first；
- Memory；
- Provenance；
- Forget；
- Retrieval；
- Receipt。

### Boujoy Harness

只参考：

- Agent UI；
- 长任务 UX；
- Approval；
- Streaming；
- Health；
- Recovery。

不得作为 UniForge 新底座。

### Research Workbench

参考：

- 动态项目；
- 自定义字段；
- 工作区；
- Record 模型。

### ielts-workbench

参考：

- IELTS 页面；
- 学习计划；
- 专项工作台。

### zeeklog IELTS

只参考资料组织。

### english-vocabulary

参考：

- Vocabulary Schema；
- 导入格式。

## 18.5 E：禁止直接采用

包括：

- 来源不明题库；
- 未明确许可的数据；
- 商业平台私有数据库；
- 来历不明微信解密源码；
- 非商业模型随附文件；
- 无权再分发的 Cambridge IELTS 材料；
- 许可证不允许商业使用的代码。

---

# 19. Sidecar 架构

重型功能运行在独立进程：

```text
UniForge
│
├ Speech Sidecar
├ OCR Sidecar
├ Document Sidecar
├ Sandbox Sidecar
├ Optional Memory Sidecar
└ Connector Sidecar
```

每个 Sidecar 必须：

- 可关闭；
- 可重启；
- 可升级；
- 有版本；
- 有协议；
- 有超时；
- 有健康检查；
- 失败不拖垮主程序。

---

# 20. 数据所有权

## 20.1 真源矩阵

| 数据 | 真源 |
|---|---|
| 普通文件 | UniForge Workspace Managed Copy |
| Obsidian 正式笔记 | Markdown |
| Git 项目 | Git |
| 课程 | UniForge SQLite |
| Exam Space | UniForge SQLite |
| Project | UniForge SQLite |
| Content | UniForge Content Graph |
| Vocabulary State | UniForge Vocabulary Domain |
| Agent Run | UniForge Agent Event Store |
| Personal Memory | Personal Core |
| API Key | Windows Credential Store |

---

# 21. 删除、遗忘与回收

三个概念必须分开：

## Remove Relation

只解除：

```text
Content ↔ Project
```

不删除内容。

## Delete

删除 UniForge 实体，进入回收站。

## Forget

用于：

- Personal Memory；
- AI Claim；
- 长期推断。

Forget 需要同时处理：

- Claim；
- Evidence Relation；
- Cache；
- Derived Index；
- Private Backup。

---

# 22. 权限系统

## 22.1 权限分级

### Low

- Search；
- Read；
- Summarize。

### Medium

- 修改草稿；
- 执行代码；
- 创建任务。

### High

- 删除；
- 外发信息；
- 修改用户项目源码（仅当前项目明确授权范围）；
- 修改数据库；
- Git push；
- 发送邮件；
- 花费明显增加；
- 更换模型供应商处理敏感数据。

## 22.2 最小权限

每个 Agent：

> 只获得当前子任务需要的权限。

任务结束：

> 临时权限撤销。

---

# 23. 语音

保持原方案：

- 全局语音；
- 输入框语音；
- 连续对话；
- STT；
- TTS；
- Interrupt；
- 可选 Wake Word。

默认：

> 原始音频处理后删除。

---

# 24. 分阶段交付 V2.1

整体路线调整为阶段 0～5；取消原阶段 6 Developer Runtime。应用内不再承担 UniForge 自我开发。

## 阶段 0：Architecture Foundation

首先验证：

### Core

- Domain Model；
- SQLite；
- Event；
- Permission；
- IPC；
- Workspace。

### Agent

验证：

```text
AgentRuntime Contract
+
LangGraph Adapter
```

至少完成：

- run；
- stream；
- interrupt；
- resume；
- checkpoint；
- failure recovery。

### Knowledge

验证：

- Markdown；
- Obsidian；
- Bok Memory PoC；
- FTS5；
- optional semantic retrieval。

### Tools

验证：

- MCP；
- Local Tool；
- File；
- Git；
- API。

### Sidecars

验证：

- OCR；
- Speech；
- Document。

退出标准：

> 不依赖任何一个 Agent Framework 才能运行基础 UniForge。

## 阶段 1：桌面基础 + 课内学习

交付：

- Shell；
- Workspace；
- SQLite；
- Event；
- Permission；
- Model Gateway；
- Agent基础能力；
- Dashboard；
- Course；
- Assignment；
- Files；
- Voice；
- Backup。

## 阶段 2：英语

交付：

- CET4；
- CET6；
- IELTS；
- 自定义考试；
- Vocabulary；
- FSRS；
- Weakness；
- Training；
- Mock Exam。

## 阶段 3：知识与情报

交付：

- Content Graph；
- Inbox；
- Source；
- Topic；
- Search；
- Obsidian；
- Memory；
- Automation。

## 阶段 4：AI 新闻

在 Content Graph 上增加：

- NewsEvent；
- Source Verification；
- Timeline；
- Recommendation；
- Correction。

## 阶段 5：项目实践

交付：

- Dynamic Project；
- Project AI Preset；
- Capability Blocks；
- Task；
- Git；
- Decision；
- Artifact；
- 软件项目代码工作区；
- Monaco / 受控终端；
- Code Agent / Test Agent / Review Agent；
- 分级 Sandbox；
- 项目构建与测试证据。

---

# 25. 阶段 1 核心验收

至少满足：

1. Windows 安装和卸载。
2. 工作区可以安全创建和迁移。
3. 数据可重启恢复。
4. 任意支持协议的模型 API 可配置。
5. API Key 不进入普通数据库和日志。
6. Renderer 无直接 Node 权限。
7. 可以创建隔离课程。
8. 可以导入课程资料。
9. 可以识别教学大纲。
10. AI 写入前显示证据。
11. Course AI 基于课程资料工作。
12. Assignment 支持三种模式。
13. 不自动提交作业。
14. 授权后可以运行代码。
15. Agent Run 有计划和状态。
16. Agent 工具使用有审批。
17. Agent 可暂停和恢复。
18. 长任务崩溃后可以恢复到安全检查点。
19. LangGraph 不拥有课程、任务等业务真源。
20. 移除 LangGraph Adapter 后核心课程功能仍可运行。
21. 语音输入可用。
22. 回收站可恢复。
23. Backup 可验证。
24. Agent 日志可回放。
25. 失败不会用模拟数据伪装成功。

---

# 26. 供应链与许可证

每一个第三方项目进入产品前记录：

```text
Repository
Commit
Version
License
Sub-license
Model License
Dataset License
Assets License
Commercial Use
Redistribution
Security
Windows Support
Maintenance
```

不能只检查根目录 LICENSE。

---

# 27. 不重复造轮子的原则

UniForge 不应该自己重写：

- Code Editor；
- Git Engine；
- Calendar UI；
- FSRS；
- MCP；
- OCR Engine；
- Speech Recognition Model；
- PDF Renderer；
- Agent Graph Scheduler；
- Sandbox Engine。

但必须自己实现：

- Course Domain；
- Exam Domain；
- Project Domain；
- Unified Task；
- Content Graph；
- Vocabulary Learning State；
- Permission；
- Approval；
- Artifact；
- Event；
- Cross-module Relationship；
- Product Workflow。

---

# 28. V2.1 核心依赖关系

推荐最终形成：

```text
                     UniForge

                        │
                UniForge Core
                        │
       ┌────────────────┼────────────────┐
       │                │                │

  Agent Platform   Knowledge Platform   Tool Platform

       │                │                │
 LangGraph           Markdown            MCP
 Native              Obsidian            Local
 Optional Mastra     Bok-inspired        API
                     Memory              CLI

       │                │                │
       └────────────────┼────────────────┘
                        │

               Domain Applications

       Course / English / Project
        Knowledge / News
```

---

# 29. V2.1 项目参考地图

```text
Agent Runtime
├ LangGraph.js
└ Mastra（备选）

Memory / Knowledge
├ Bok
└ Obsidian

Agent Desktop UX
└ Boujoy Harness

English
├ ts-fsrs
├ english-vocabulary
├ ielts-workbench
└ zeeklog IELTS

Project Workbench
└ Research Workbench

Desktop
├ Electron
├ React
└ TypeScript

Software Project UI
├ Monaco
└ xterm.js

Git
└ simple-git

Tools
└ MCP

Speech
├ sherpa-onnx
└ whisper.cpp

OCR
└ PaddleOCR

Document
└ Docling
```

---

# 30. 成功标准

UniForge 成功的标准不是：

> “集成了多少 Agent”。

也不是：

> “用了多先进的 Agent Framework”。

真正成功应该表现为：

### 学习

用户可以在一个课程中：

```text
资料
→ 理解
→ 作业
→ 错误
→ 掌握度
→ 复习
→ 考试
```

形成完整闭环。

### 英语

```text
单词
→ 错误维度
→ FSRS
→ 专项
→ 模考
→ 能力变化
```

可解释。

### 知识

```text
信息
→ 来源
→ 整理
→ 关系
→ 知识
→ 行动
```

可追溯。

### 项目

```text
目标
→ 任务
→ 实验/代码
→ 决策
→ 成果
→ 复盘
```

完整保留。

### Agent

用户始终知道：

- Agent 在做什么；
- 使用哪些数据；
- 调用了什么工具；
- 修改了哪些文件；
- 花费多少；
- 为什么暂停；
- 为什么需要审批；
- 是否真正通过测试。


---

# 31. 尚待阶段实施确认

以下事项仍需在对应阶段重新确认：

- LangGraph.js 实际锁定版本；
- 是否最终需要 Mastra Adapter；
- Bok 是架构参考还是部分代码复用；
- Personal Core 的最终 Schema；
- Windows Sandbox 实现；
- 英语词表合法数据源；
- IELTS 正式资料来源；
- 微信连接器；
- 抖音连接器；
- MCP SDK 稳定版本；
- Embedding Provider；
- Plugin Signing；
- Update Server；
- UniForge 最终许可证。

---

# 32. 当前架构结论

UniForge V2.1 不再以 DeepSeek Harness 或任何其他 Agent Harness 作为产品底层。

正式定义改为：

> **UniForge 是拥有自主领域模型、统一数据真源、事件系统、权限系统、知识关系、Agent 契约、Model Gateway 与 Tool Gateway 的本地优先 AI 工作平台。第三方 Agent、Workflow、Memory、Sandbox 和连接器框架均作为可替换能力，通过稳定契约接入，任何单个第三方项目都不得成为 UniForge 业务状态或用户数据的唯一所有者。UniForge 本体源码不向应用内 Agent 暴露写权限，产品内部不提供自我开发链路。**

这意味着：

```text
Framework can change.
UniForge remains.
```

---

# 33. 后续开发入口

下一开发对话禁止直接进入阶段 1。

第一步必须是：

```text
阶段 0
Architecture Foundation
```

顺序建议：

```text
1 Domain Model
2 SQLite Schema
3 Event Architecture
4 Permission Model
5 IPC Contract
6 AgentRuntime Contract
7 ModelGateway Contract
8 ToolGateway Contract
9 Workspace Layout
10 LangGraph PoC
11 Bok Memory PoC
12 MCP PoC
13 File/OCR/Speech PoC
14 Windows Build
15 Test Pipeline
```

阶段 0 验收后，才能正式进入：

> 阶段 1：桌面基础与课内学习闭环。

---

# 34. 最终设计原则

整个 UniForge 后续开发必须持续遵守：

1. **UniForge 是平台，不是某个 Agent Framework 的 UI。**
2. **业务对象归 Domain Core，不能归 Agent。**
3. **一个对象只有一个正式真源。**
4. **Agent Runtime 必须可替换。**
5. **模型供应商必须可替换。**
6. **工具和连接器必须可替换。**
7. **知识和长期记忆必须有来源。**
8. **向量索引只是缓存。**
9. **复杂自动化必须可暂停。**
10. **高风险操作必须确认。**
11. **正式修改必须留下证据。**
12. **所有重要状态必须可恢复。**
13. **能复用成熟组件就不重复造轮子。**
14. **完整开源应用优先参考，不轻易成为核心依赖。**
15. **许可证、题库、模型和数据必须分别审查。**
16. **失败必须真实暴露，不允许假完成。**
17. **应用内 Agent 不得修改 UniForge 本体源码、安装目录、更新器或核心迁移逻辑。**
18. **软件项目开发能力只作用于用户明确授权的项目工作区。**
19. **任何框架都可以被替换，而 UniForge 的数据和产品能力必须继续存在。**
