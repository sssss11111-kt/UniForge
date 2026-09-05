# UniForge

> 面向大学生的本地优先 AI 桌面工作台。

UniForge 不是一个“更大的聊天框”，而是一个把课程、英语备考、项目、知识、情报、AI 新闻与 Agent 自动化统一到同一套长期工作系统中的 Windows 桌面应用。

核心目标：

> 让课程、考试、项目、知识、任务、来源、记忆、Agent 和成果成为长期存在、可追踪、可恢复的真实对象，让 AI 在明确上下文、明确权限和明确证据下持续参与学习与项目工作。

---

## 当前状态

当前架构版本：

```text
UniForge V2.1
```

当前开发路线：

```text
Stage 0   Architecture Foundation
↓
Stage 0.5 UI / UX Design & Design System
↓
Stage 1   Desktop Foundation + Course
↓
Stage 2   English
↓
Stage 3   Knowledge & Intelligence
↓
Stage 4   AI News
↓
Stage 5   Project Practice
```

开发必须按阶段推进。

在 Stage 0 完成并验收前，不进入正式业务开发。

在 Stage 0.5 的 Design System、页面规格和核心 Prototype 未确认前，不进入 Stage 1 的完整 React UI 实现。

---

# 为什么做 UniForge

大学生日常学习和项目工作往往被拆散在不同工具里：

- 课表和教学大纲在一个地方；
- 作业和通知在微信群；
- 资料散落在本地文件夹；
- 项目代码在 Git；
- 决策存在聊天记录；
- 竞赛信息来自群聊和网页；
- 英语单词和错题存在多个 App；
- 知识笔记放在 Obsidian；
- AI 对话又分散在不同平台和不同会话。

普通 AI 工具通常只能看到当前对话。

它不知道：

- 当前内容属于哪门课程；
- 这是哪个考试的一部分；
- 某个文件属于哪个项目；
- 用户之前做过什么决定；
- 当前任务是否已经完成；
- 某条信息来自哪里；
- 某个 Agent 是否有权限修改文件；
- 某个结论是否已经被证据支持。

UniForge 希望把这些零散上下文连接起来。

---

# 产品定位

UniForge 是一个：

- Windows 优先；
- Local-first；
- Object-centered；
- Agent-assisted；
- Evidence-first；
- Permission-aware；
- Framework-replaceable；

的大学生 AI 工作台。

核心原则：

```text
Framework can change.
UniForge remains.
```

UniForge 自己拥有：

- Domain Core；
- 业务数据；
- Event；
- Permission；
- Approval；
- Model Gateway；
- Tool Gateway；
- Knowledge / Memory；
- Workspace；
- 产品工作流。

LangGraph、MCP、OCR、语音、文档解析和其他第三方项目只作为可替换能力接入。

---

# 一级模块

UniForge 当前规划总览 + 六个工作模块，共七个一级入口：

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

```text
设置
模型中心
权限与隐私
工作区
连接器
关于与诊断
```

---

# 00 总览

总览只回答一个问题：

> 我现在最应该做什么？

主要内容：

- 今日焦点；
- 快速开始；
- 课程与考试；
- 英语备考；
- 项目动态；
- 情报与新闻；
- Agent 与审批；
- 最近空间。

推荐优先级：

```text
用户置顶
> 明确截止日期
> 已确认计划
> AI 风险建议
> 普通推荐
```

AI 推荐必须能够解释：

> 为什么推荐这件事。

---

# 01 Agent 执行中心

Agent 执行中心负责：

- 多步骤任务；
- 长任务；
- Agent 协作；
- Workflow；
- 审批；
- 产物；
- 执行回放。

主要入口：

```text
新建任务
执行现场
任务队列
Agent 团队
工作流
定时任务
审批中心
产物中心
运行回放
```

Agent Run 必须具备明确状态，例如：

```text
CREATED
RUNNING
WAITING_APPROVAL
PAUSED
FAILED
CANCELLED
COMPLETED
```

用户应该始终知道：

- Agent 在做什么；
- 当前执行哪一步；
- 使用了哪些数据；
- 调用了哪些工具；
- 修改了哪些文件；
- 是否需要审批；
- 为什么失败；
- 能否恢复；
- 产生了哪些 Artifact；
- 使用了多少模型资源。

---

# 02 课内学习

课内学习是 UniForge 第一个完整业务闭环。

主要入口：

```text
学期总览
课程空间
作业中心
考试与复习
学习资料
学习记录
课程档案
```

目标闭环：

```text
资料
→ 理解
→ 作业
→ 错误
→ 掌握度
→ 复习
→ 考试
```

课程支持：

- 手动创建；
- 教学大纲导入；
- 课表截图识别；
- PDF 导入；
- 教师资料识别。

AI 可以提取：

- 课程；
- 章节；
- 作业；
- 考试；
- 截止时间。

但正式写入前必须：

```text
Evidence
↓
Preview
↓
User Confirmation
↓
Domain Write
```

---

## Course AI

每门课程拥有一个前台 Course AI。

后台按任务临时使用：

```text
Explanation Agent
Search Agent
Exercise Agent
Code Agent
Review Planner
```

不预先创建大量永久 Agent。

课程 AI 的来源优先级：

```text
课程资料
> 用户授权的个人知识
> 模型知识
> 按需网络
```

---

## Assignment 模式

支持：

```text
Tutoring
Collaboration
Task Execution
```

默认：

```text
Collaboration
```

系统不得自动向学校系统提交作业。

---

# 03 英语备考

支持：

```text
CET4
CET6
IELTS
Custom Exam
```

未来可以扩展：

- TOEFL；
- 考研英语；
- 专四；
- 专八。

主要入口：

```text
备考总览
考试空间
背单词
错词与薄弱项
专项训练
模考与成绩
资料与题库
同步/导入
学习记录
英语 AI
```

---

## 统一 Vocabulary Model

UniForge 不为不同考试建立完全独立的个人单词状态。

例如不采用：

```text
CET4Word
CET6Word
IELTSWord
```

而采用：

```text
VocabularyEntry
├─ senses
├─ pronunciations
├─ phrases
├─ examples
├─ morphology
└─ examRelations
   ├─ CET4
   ├─ CET6
   └─ IELTS
```

同一个词只有一个个人学习状态。

---

## 学习维度

词汇掌握度至少区分：

- 认义；
- 拼写；
- 听辨；
- 发音；
- 词性；
- 词形；
- 搭配；
- 语境；
- 熟词生义。

一次错误不会简单变成：

> “这个词不会”。

---

## FSRS

基础间隔重复使用：

```text
ts-fsrs
```

UniForge 在其之上叠加：

- 考试日期；
- 错误类型；
- 考试重要度；
- 每日学习上限；
- 用户时间；
- 近期表现。

---

# 04 项目实践

项目支持：

```text
竞赛
科研
软件
课程设计
自定义
```

所有项目至少包含：

```text
Project Home
Tasks
Files
Project AI
Decisions
Artifacts
```

其他功能通过 Capability Blocks 动态出现。

---

## 软件项目

```text
Code
Test
Release
```

可启用：

- Monaco；
- 文件树；
- 全文搜索；
- 受控终端；
- Git；
- branch / worktree；
- 编译；
- 测试；
- 调试；
- Code Agent；
- Test Agent；
- Review Agent；
- Sandbox；
- 构建产物。

---

## 科研项目

```text
Literature
Experiment
Data
Paper
```

---

## 竞赛 / 电赛项目

```text
Hardware
Components
Circuit
Firmware
Debug
Experiment
```

---

# 重要安全边界：UniForge 不开发自己

UniForge V2.1 已取消独立的：

```text
07 开发区
```

运行中的 UniForge 不提供“自我开发”能力。

应用内 Agent 永远不得修改：

- UniForge 本体源码；
- UniForge 安装目录；
- 更新器；
- 核心 Migration 实现；
- 权限内核；
- UniForge 构建与签名逻辑。

UniForge 自身源码开发只能发生在应用外：

```text
外部源码仓库
↓
需求 / Spec
↓
独立 branch / worktree
↓
编码
↓
测试
↓
审查
↓
构建
↓
签名
↓
发布
```

软件开发能力只用于：

> 用户明确授权的软件项目工作副本。

---

# 05 知识与情报

知识与情报模块负责统一整理：

- 微信；
- 抖音；
- 网页；
- PDF；
- 图片；
- 截图；
- RSS；
- 手动输入；
- 其他连接器来源。

主要入口：

```text
情报收件箱
采集来源
待整理
主题追踪
Obsidian
自动化规则
来源追溯
```

---

## Content Graph

核心对象：

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

同一内容可以出现在多个视图中，但只有一个正式内容实体。

例如：

```text
ContentEntity
├─ Inbox
├─ WeChat
├─ Topic
├─ Project
└─ Obsidian Candidate
```

这些都是关系，不是五份独立正文。

---

# 06 AI 新闻

AI 新闻建立在 Content Graph 上，而不是重新实现一套 Feed 数据系统。

核心对象：

```text
NewsEvent
```

多个来源可以属于同一个事件：

```text
NewsEvent
├─ Official Announcement
├─ GitHub Release
├─ Documentation
├─ Paper
├─ Media
└─ Community Discussion
```

主要入口：

```text
今日 AI
模型与产品
开源雷达
AI 工具
论文与研究
国内动态
主题追踪
稍后阅读
新闻来源
```

---

## 更正机制

新的事实不会静默改写历史。

采用：

```text
Original Claim
↓
Update
↓
Correction
↓
Current Summary
```

如果旧结论已经进入用户正式笔记：

> 提醒用户更新，而不是自动覆盖正式笔记。

---

# 核心架构

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

---

# Agent Runtime

UniForge 自定义稳定的：

```text
AgentRuntime Contract
```

复杂 Agent Runtime 首选：

```text
LangGraph.js
```

但 LangGraph 只是可替换实现。

必须始终满足：

```text
LangGraph State
≠
UniForge Domain State
```

LangGraph Checkpoint 只属于执行状态。

SQLite 中的 UniForge Domain Data 才是业务真源。

简单 AI 操作可以直接走：

```text
Domain Service
↓
Model Gateway
↓
Tool Gateway
```

不强制所有请求都经过 LangGraph。

---

# Model Gateway

模型系统由 UniForge 自己控制。

设计目标支持：

```text
OpenAI
Anthropic
Gemini
DeepSeek
Qwen
Ollama
OpenAI Compatible
Custom Adapter
```

统一调用能力：

```text
generate
stream
embed
probeCapabilities
estimateUsage
```

路由层级：

```text
Single Run
→ Agent Preset
→ Course / Project
→ Module
→ Global
→ Fallback
```

Agent Runtime 不拥有：

- API Key；
- 模型目录；
- 模型价格；
- Provider 路由；
- 用户预算。

---

# Tool Gateway

所有 Agent 工具统一经过：

```text
Tool Gateway
```

可以接入：

```text
Internal Tool
MCP
Local CLI
HTTP API
Connector
Plugin
Project Development Tool
```

MCP 用于外部工具和连接器边界。

内部 Domain Service 之间不使用 MCP 替代 typed contract。

---

# Knowledge & Memory

UniForge 严格区分：

```text
Conversation Context
```

与：

```text
Long-Term Memory
```

对话不会自动成为长期记忆。

长期记忆采用类似：

```text
Conversation
↓
Receipt
↓
Evidence
↓
Memory Candidate
↓
Conflict / Scope / Authorization
↓
Memory Claim
↓
Outcome
```

的准入流程。

长期 Memory 必须：

- 有来源；
- 有 Evidence；
- 有 Scope；
- 可审查；
- 可 Forget；
- 可重建派生索引。

---

# 数据真源

| 数据 | 正式真源 |
|---|---|
| 普通导入文件 | UniForge Managed Copy |
| Obsidian 正式笔记 | Markdown |
| Git 项目版本 | Git |
| Course | UniForge SQLite |
| Exam Space | UniForge SQLite |
| Project | UniForge SQLite |
| Content | UniForge Content Graph |
| Vocabulary State | UniForge Vocabulary Domain |
| Agent Run | UniForge Agent Event Store |
| Personal Memory | Personal Core |
| API Key | OS Secure Credential Store |

搜索索引、Vector Index、Cache 和 Projection 都属于：

> 可重建派生状态。

---

# 权限系统

权限至少分为：

```text
LOW
MEDIUM
HIGH
```

高风险行为包括：

- 删除；
- 外发数据；
- 修改用户项目源码；
- 高风险数据库修改；
- Git push；
- 发送信息；
- 明显增加模型费用；
- 切换 Provider 处理敏感数据。

原则：

> Agent 只获得当前子任务需要的最小权限。

临时权限在任务结束后撤销。

---

# Electron 安全边界

Renderer：

> 只负责 UI。

Renderer 不直接访问：

- Node.js；
- SQLite；
- filesystem；
- credentials；
- shell；
- arbitrary process。

正式路径：

```text
Renderer
↓
Typed Preload API
↓
Validated IPC
↓
Application Service
↓
Domain / Infrastructure
```

---

# Sidecar

重型能力通过独立 Sidecar 或受控进程运行。

可能包括：

```text
Speech Sidecar
OCR Sidecar
Document Sidecar
Sandbox Sidecar
Connector Sidecar
```

Sidecar 必须：

- 可启动；
- 可停止；
- 可取消；
- 可健康检查；
- 可重启；
- 有版本；
- 有超时；
- 崩溃不拖垮主程序。

---

# UI / UX

完整 UI 设计在：

```text
Stage 0.5
```

完成。

设计范围包括：

- Design System；
- App Shell；
- 一级/二级导航；
- 页面规范；
- Agent 状态；
- Approval；
- Empty / Loading / Error；
- Accessibility；
- 高保真 Prototype。

页面实现顺序：

```text
Domain Contract
↓
Application Service
↓
IPC
↓
React Implementation
↓
Integration Test
↓
E2E
↓
Visual Verification
```

不要：

```text
先做完整前端
↓
以后再补业务
```

---

# 主要技术栈

计划中的主要技术方向：

```text
Desktop
├─ Electron
├─ React
├─ TypeScript
├─ Node.js
└─ Electron Forge

Storage
└─ SQLite

Agent
├─ UniForge AgentRuntime Contract
├─ Native Runtime
└─ LangGraph.js Adapter

Editor / Project
├─ Monaco
├─ xterm.js
└─ simple-git

Tools
└─ MCP

English
└─ ts-fsrs

Speech
├─ sherpa-onnx
└─ whisper.cpp

OCR
└─ PaddleOCR

Document
└─ Docling

Testing
├─ Vitest
├─ React Testing Library
└─ Playwright
```

具体版本不在 README 中固定。

进入对应阶段时必须重新核验：

- 官方版本；
- Security Advisory；
- Windows 支持；
- License；
- Breaking Change。

---

# 开源项目参考

UniForge 遵循：

> 能复用成熟组件就不重复造轮子，但完整开源应用优先作为参考，不轻易变成核心依赖。

当前主要参考：

### Bok

参考：

- Local-first Memory；
- Provenance；
- Forget；
- Receipt；
- Retrieval。

### Boujoy Harness

只参考：

- Agent Desktop UX；
- Streaming；
- Approval；
- Long-running Task；
- Recovery。

不作为 UniForge 底层。

### Research Workbench

参考：

- 动态项目；
- 自定义字段；
- Workspace；
- Record 模型。

### ielts-workbench

参考：

- IELTS 信息架构；
- 学习计划；
- 专项工作台。

### english-vocabulary

参考：

- Vocabulary Schema；
- Import Format。

未完成许可核验前，不直接打包其数据。

### zeeklog IELTS

只参考资料组织方式。

不直接再分发来源不明确或无授权的 IELTS / Cambridge 内容。

---

# 仓库结构

计划结构：

```text
uniforge/
├─ AGENTS.md
├─ README.md
│
├─ apps/
│  └─ desktop/
│     ├─ src/
│     │  ├─ main/
│     │  ├─ preload/
│     │  └─ renderer/
│     └─ tests/
│
├─ packages/
│  ├─ contracts/
│  ├─ core/
│  ├─ infrastructure/
│  ├─ platform-agent/
│  ├─ platform-model/
│  ├─ platform-tool/
│  ├─ platform-knowledge/
│  ├─ platform-sidecar/
│  ├─ platform-connectors/
│  ├─ domain-dashboard/
│  ├─ domain-course/
│  ├─ domain-english/
│  ├─ domain-project/
│  ├─ domain-content/
│  └─ domain-news/
│
├─ sidecars/
│  ├─ speech/
│  ├─ ocr/
│  ├─ document/
│  └─ sandbox/
│
├─ fixtures/
│
├─ docs/
│  ├─ specs/
│  ├─ design/
│  ├─ architecture/
│  ├─ decisions/
│  ├─ governance/
│  ├─ test-evidence/
│  ├─ release/
│  └─ superpowers/
│     └─ plans/
│
└─ scripts/
```

实际目录如果与此不同，以经过批准的 ADR 和当前仓库结构为准。

---

# 文档真源

核心文档建议放置：

```text
docs/specs/
└─ 2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md

docs/superpowers/plans/
└─ 2026-09-05-uniforge-v2.1-complete-development-plan-with-ui.md

docs/design/
├─ UI-DESIGN-SPEC.md
├─ DESIGN-SYSTEM.md
├─ INFORMATION-ARCHITECTURE.md
├─ INTERACTION-RULES.md
├─ ACCESSIBILITY.md
└─ VISUAL-STATE-MATRIX.md

docs/governance/
└─ third-party-registry.md

/
└─ AGENTS.md
```

`AGENTS.md` 负责 Agent 行为约束。

README 负责项目介绍。

产品细节、架构真源和完整开发任务不应重复维护在 README 中。

---

# 开发工作流

非简单修改建议使用独立：

```text
branch
+
worktree
```

基本循环：

```text
需求 / Spec
↓
Acceptance Criteria
↓
Failing Test
↓
Minimal Implementation
↓
Focused Test
↓
Regression Test
↓
Security / Permission Review
↓
Evidence
↓
Git Commit
```

禁止：

- 删除测试来让实现通过；
- 弱化断言；
- 修改验收标准迁就已有实现；
- 用 Mock 结果冒充真实成功；
- 在失败状态下宣称完成。

---

# 测试

UniForge 计划建立以下测试层：

```text
Unit
Integration
Electron E2E
Security
Recovery
Packaging
License / Supply Chain
```

重点覆盖：

- Domain State；
- SQLite；
- Migration；
- Event Replay；
- Projection Rebuild；
- IPC；
- Permission；
- Approval；
- Model Gateway；
- Tool Gateway；
- MCP；
- Sidecar；
- Filesystem Boundary；
- Git；
- Obsidian；
- Backup / Restore；
- Agent Pause / Resume；
- Crash Recovery；
- Protected Path。

---

# 第三方依赖治理

生产依赖必须登记到：

```text
docs/governance/third-party-registry.md
```

至少记录：

```text
Repository
Commit / Tag
Version
License
Sub-license
Model License
Dataset License
Assets License
Commercial Use
Redistribution
Windows Support
Security Notes
Maintenance Status
Integration Level
```

公开在 GitHub：

> 不等于可以随意复制、打包或商业再分发。

---

# Stage 0

Stage 0 是正式开发的第一步。

主要任务：

```text
1  Engineering Baseline
2  Domain Model
3  SQLite Schema
4  Event Architecture
5  Permission / Approval
6  IPC Contract
7  Workspace / File Ownership
8  Model Gateway
9  Tool Gateway
10 AgentRuntime Contract
11 Native Runtime
12 LangGraph PoC
13 Knowledge / Memory PoC
14 MCP PoC
15 OCR / Speech / Document PoC
16 Backup / Diagnostic Foundation
17 Windows Build
18 Test Pipeline
```

退出标准：

> 不依赖任何单一 Agent Framework，UniForge 的基础架构仍然成立。

---

# Stage 0.5

Stage 0 通过后进行完整 UI / UX 设计。

交付：

```text
Design System V1
App Shell
Information Architecture
Dashboard
Agent Center
Course
English
Project
Knowledge
AI News
Settings
Model Center
Permission Center
Connector UI
State Matrix
Interaction Rules
Accessibility
High-fidelity Prototype
```

Stage 0.5 可以提前设计未来模块，但不提前实现未来模块的业务逻辑。

---

# Stage 1

目标：

> 完成桌面基础和课内学习闭环。

主要交付：

- App Shell；
- Dashboard；
- Workspace；
- Model Gateway 正式版；
- Agent 执行中心基础版；
- Course；
- Assignment；
- Course AI；
- File Import；
- Evidence；
- Notes；
- Wrong Problems；
- Mastery；
- Review Plan；
- Voice；
- Backup / Recycle。

---

# Stage 2

目标：

> 完成英语备考闭环。

交付：

- CET4；
- CET6；
- IELTS；
- Custom Exam；
- Vocabulary；
- 九维学习状态；
- FSRS；
- Weakness；
- Adaptive Training；
- Mock Exam；
- Learning Record。

---

# Stage 3

目标：

> 建立统一知识与情报系统。

交付：

- Content Graph；
- Inbox；
- Source；
- Topic；
- Search；
- Dedupe；
- Obsidian；
- Personal Memory；
- Connector；
- Automation Rules；
- Provenance；
- Forget。

---

# Stage 4

目标：

> 在 Content Graph 上构建事件级 AI 新闻系统。

交付：

- NewsEvent；
- Source Verification；
- Event Merge；
- Timeline；
- Ranking；
- Correction；
- News → Course / Project / Task。

---

# Stage 5

目标：

> 完整支持竞赛、科研、软件和课程设计项目。

交付：

- Project Domain；
- Capability Blocks；
- Project AI Preset；
- Goal / Milestone / Task；
- Decisions；
- Artifacts；
- Git；
- Monaco；
- Terminal；
- Code / Test / Review Agents；
- Sandbox；
- Protected Path；
- Build / Test Evidence。

---

# 当前最重要的原则

```text
先把内核做稳
↓
再冻结 UI / UX
↓
再完成一个真实课程闭环
↓
再扩展英语
↓
再建立知识与情报
↓
再建立 AI 新闻
↓
最后完成复杂项目实践
```

而不是：

```text
先把所有页面做出来
↓
再慢慢补真实业务
```

---

# Agent 开发规则

所有 Codex / AI Agent 在本仓库工作前都必须阅读：

```text
AGENTS.md
```

其中包含：

- Stage Gate；
- Source of Truth；
- Domain Boundary；
- Permission；
- IPC；
- Protected Path；
- Agent Runtime；
- Model Gateway；
- Tool Gateway；
- UI；
- Third-party；
- Testing；
- Git；
- Completion Evidence。

---

# License

UniForge 最终许可证尚未冻结。

在正式确定前：

- 不假设项目已经采用某个开源许可证；
- 不向第三方声明未确认的授权范围；
- 第三方依赖继续按照各自许可证独立审查。

最终许可证决策应记录在：

```text
docs/decisions/
```

和：

```text
docs/governance/
```

---

# Project Principle

UniForge 最重要的一句话：

> **AI 可以帮助用户学习、整理知识、完成项目并开发自己的软件，但运行中的 UniForge 不允许 AI 改写 UniForge 自己。**

以及：

> **第三方框架可以替换，UniForge 的业务数据、产品能力和用户工作成果必须继续存在。**


Runtime Checkpoint 非业务真源，但不能当普通缓存清理；缺失或版本不兼容须安全暂停。2026-09-05 审阅修订与 Stage 0 开发已获用户确认，尚未完成 Stage 0 验收。
