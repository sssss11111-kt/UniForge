# UniForge UI Design System V2 and Modules 03-06 Design Specification

> Status: Draft for user review. Design clarification only; this document does not authorize production UI implementation.

**Date:** 2026-09-07  
**Owner:** Tong <17512401625@163.com>  
**Scope:** UI Design System V2, App Shell, and modules 03–06.

## 1. Design goal

UniForge is a Windows-first, local-first AI learning and project workbench. The UI presents durable objects, evidence, permissions, tasks, and recoverable Agent runs. AI is attached to context and commands, not the visual identity.

Replace the current dark GitHub-like presentation with a warm editorial desktop workspace: ivory canvas, off-white surfaces, warm gray separators, near-black text, restrained apricot accents, 1px borders, small radii, compact typography, and limited elevation. Target 1440 x 900; remain usable from 1280 x 800.

## 2. Source hierarchy and reference use

Governing constraints:

- `AGENTS.md`
- `docs/specs/2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md`
- `docs/superpowers/plans/2026-09-05-uniforge-v2.1-complete-development-plan-with-ui.md`

`C:\Users\Tong\Downloads\uniforge-ui-generation-prompt.md` defines visual direction. `uniforge-ui-reference.png` contributes visual language only; do not copy its brand, text, logo, or page structure. `uniforge-open-source-reference.md` is a research index; referenced projects, code, data, audio, question banks, and assets require license review and a registry entry before adoption.

## 3. Non-negotiable boundaries

- There is no `07 开发区`.
- Software development exists only under `04 项目实践 → 软件项目`.
- Project Agents may modify only an explicitly authorized project working copy.
- UniForge source, installation directory, updater, migrations, permission kernel, and build/signing infrastructure remain protected.
- Renderer is presentation only and uses minimal typed Preload APIs.
- Domain Core and SQLite are business truth; indexes, vectors, caches, projections, and checkpoints are derived/runtime state.
- Agents, LangGraph, connectors, sidecars, and UI never write domain tables directly.
- Destructive, external, project-file, Git push, connector-write, and sensitive-model actions show scope and approval.
- The UI never claims success without evidence.

## 4. App Shell V2

```text
┌──────────┬─────────────┬────────────────────────┬────────────┐
│ Primary  │ Secondary   │ Main work area         │ Inspector  │
│ nav      │ nav         │                        │ / status   │
├──────────┴─────────────┴────────────────────────┴────────────┤
│ Command / Agent bar                                           │
└───────────────────────────────────────────────────────────────┘
```

- Primary navigation: 76px, collapsible to 64px.
- Secondary navigation: 216px.
- Main work area: flexible; reading surfaces cap at 1180px.
- Inspector/status: 288px, open at 1440px and collapsible.
- Command bar: 64px; quiet command surface, never a large chat panel.

Primary entries are `00 总览`, `01 Agent 执行中心`, `02 课内学习`, `03 英语备考`, `04 项目实践`, `05 知识与情报`, `06 AI 新闻`. Utility entries are 设置、模型中心、权限与隐私、工作区、连接器、关于与诊断.

A selected item uses pale apricot fill and a dark left rule. A roadmap item is disabled only while its real snapshot and typed IPC slice are unavailable.

Command bar fields: command, attachments, context chips, Agent mode, model, permission indicator, execute, and actual run status.

## 5. Design tokens

```text
canvas #F4EFE7       surface #FFFDF9       elevated #FFFFFF
surface-warm #F9F0E5 text #22201D         muted #706A62
border #282521       focus #B96B35          accent #D98A52
success #56745C      warning #9A6A2F        danger #A24B43
approval #8B5E34     running #5E7180        paused #7A6F62
```

Typography uses `Segoe UI`, `Microsoft YaHei UI`, and an approved CJK-capable fallback; Latin uses an Inter-like system fallback. Page title is 22px, section title 15px, body 13px, metadata 11–12px, code uses a system monospace stack. Spacing is 4/8/12/16/24/32/48px; radius is 6px for controls and 8px for panels; default border is 1px; dialogs may use one restrained shadow.

Forbidden: purple-blue gradients, neon, glow, glassmorphism, aurora, sparkle motifs, robot avatars, giant Ask AI buttons, giant hero text, and excessive card or pill usage.

## 6. Shared component contract

Provider-neutral renderer components:

`AppShell`, `PrimaryNav`, `SecondaryNav`, `Breadcrumbs`, `ObjectHeader`, `Section`, `StatusBadge`, `EvidenceList`, `PermissionNotice`, `ApprovalCard`, `AgentRunTimeline`, `TaskRow`, `ArtifactCard`, `SourceBadge`, `InspectorPanel`, `DataTable`, `CommandBar`, `EmptyState`, `ErrorState`, `OfflineBanner`, `ConfirmDialog`, `Toast`, `SidecarHealthCard`.

Components receive typed view models and import no Electron, Node.js, SQLite, LangGraph, or provider SDK types. They define keyboard focus, disabled, loading, empty, error, offline, read-only, approval-required, and success states as applicable.

## 7. Module 03: English Preparation

Secondary navigation: 备考总览、考试空间、背单词、错词与薄弱项、专项训练、模考与成绩、资料与题库、同步 / 导入、学习记录、英语 AI.

Core screens:

- Overview: exam spaces, days to exam, review load, performance, weak dimensions, next action and reason.
- Exam Space: CET4, CET6, IELTS, Custom; rules are scoped to the exam, vocabulary state is shared through one `VocabularyEntry`.
- Vocabulary: recognition, spelling, listening, pronunciation, grammar, morphology, collocation, context, polysemy.
- Weakness: error dimension, exam relevance, recency, FSRS schedule, provenance.
- Training: listening, reading, writing, speaking with source and completion evidence.
- Mock results: attempts, section scores, trends, evidence, and user corrections.
- IELTS workspace: Overview, Plan, Vocabulary, Listening, Reading, Writing, Speaking, Mock Exam, Materials, AI Coach.

Import shows source, license, count, and deduplication before write. AI explanations remain proposals until a typed domain command stores them. Synchronization requires configured connector and explicit authorization. Offline mode preserves local progress and marks remote actions unavailable.

## 8. Module 04: Project Practice

Secondary navigation: 项目总览、任务、文件、Project AI、决策、产物、活动与证据.

Base objects: Project, Task, FileRef, Decision, Artifact, AgentRun, Approval, Evidence. Capability blocks are dynamic:

- Software: Code, Test, Release.
- Research: Literature, Experiment, Data, Paper.
- Electronic contest: Hardware, Components, Circuit, Firmware, Debug, Experiment.

Project overview shows goal, success criteria, milestone, next task, evidence, approvals, and authorized workspace. Tasks show status, owner, deadline, dependency, milestone, and evidence. Decisions record question, options, choice, rationale, evidence, author, and impact. Artifacts show type, provenance, checksum where applicable, tests, and approval.

Software workspace layout: file tree left; editor center; terminal/test output below; Project AI, Git, and context inspector right. File changes show canonical root, affected paths, operation, reason, permission, diff, and test result. Terminal, build, test, commit, push, external transmission, and deletion have separate capabilities and approvals.

## 9. Module 05: Knowledge & Intelligence

Secondary navigation: 情报收件箱、采集来源、待整理、主题追踪、Obsidian、自动化规则、来源追溯.

Inbox is a three-column reader: source filters, ContentEntity list, selected details. Details show title, source kind, captured time, summary, topics, related course/project, and lifecycle.

Sources show scope, health, last attempt, permission, and failure evidence. Review supports classify, relate, summarize, create topic, create memory candidate, export to Obsidian, archive, delete, and forget as distinct actions. Topic tracking relates ContentEntity, Topic, Course, Project, NewsEvent, and ObsidianNote without copying canonical bodies.

Obsidian shows selected Vault, pending writes, diff, target path, and approval. Memory review follows Receipt → Evidence → Candidate → conflict/scope/authorization → Claim → outcome. Forget invalidates dependent derived indexes and caches and reports the result. Search results are labeled derived state and offer rebuild when stale.

## 10. Module 06: AI News

Secondary navigation: 今日 AI、模型与产品、开源雷达、AI 工具、论文与研究、国内动态、主题追踪、稍后阅读.

Today AI is a grouped digest: model/product updates, research, open source, tools, and domestic developments. NewsEvent detail presents Official, GitHub, Docs, Media, and Community sources, publication/update times, verification, claims, corrections, and related objects. Ranking shows relevance, freshness, source quality, and topic subscription inputs.

News → Action creates a task, knowledge relation, project action, or reading item through a typed proposal and approval path. Unverified claims remain labeled; corrections preserve prior versions; fetch failures never become successful events.

## 11. Unified state matrix

Every module and shared component defines `loading`, `empty`, `error`, `offline`, `read-only`, `permission denied`, `approval required`, and `success`. Agent surfaces also define `running`, `waiting approval`, `paused`, `failed`, `cancelled`, and `completed`.

Loading uses skeletons or stable placeholders. Empty explains the next valid action. Errors show a reason and diagnostic reference. Offline distinguishes local work from unavailable remote operations. Read-only keeps evidence visible and removes mutation controls. Approval shows operation, scope, reason, expiration, and allow-once/deny choices. Completed links to evidence or artifacts.

## 12. Data flow and security

```text
Renderer intent → typed Preload API → IPC validation → permission check
→ approval when required → Application Service → Domain transaction
→ Domain Event → projection/snapshot → Renderer update
```

Transient view state may exist in the Renderer; domain objects are never duplicated there. Protected-path checks resolve canonical authorized paths and reject traversal, symlink, junction, and unrelated workspace access.

## 13. Accessibility

Keyboard navigation covers primary/secondary nav, lists, tabs, dialogs, command bar, and inspector. Focus rings remain visible. Color never carries state alone. Tables and timelines expose semantic relationships. Dialogs trap focus and support safe Escape cancellation. Reduced motion disables nonessential transitions.

## 14. Implementation decomposition

Create three independently reviewable plans:

1. UI Design System V2 + App Shell.
2. Modules 03–04: English + Project Practice.
3. Modules 05–06: Knowledge + AI News.

Each plan uses typed contract → Application Service → Preload/IPC → renderer view → focused tests → Electron E2E → visual verification. A module becomes enabled only when its real snapshot, error states, and typed IPC slice exist.

Required renderer ownership paths include:

- `apps/desktop/src/renderer/index.html`
- `apps/desktop/src/renderer/app.js`
- `apps/desktop/src/renderer/app.css`
- `apps/desktop/src/renderer/ui/tokens.css`
- `apps/desktop/src/renderer/ui/components.js`
- `apps/desktop/src/renderer/ui/layout.js`
- `apps/desktop/src/renderer/ui/state.js`
- `apps/desktop/src/renderer/modules/overview.js`
- `apps/desktop/src/renderer/modules/agent-center.js`
- `apps/desktop/src/renderer/modules/course.js`
- `apps/desktop/src/renderer/modules/english.js`
- `apps/desktop/src/renderer/modules/projects.js`
- `apps/desktop/src/renderer/modules/knowledge.js`
- `apps/desktop/src/renderer/modules/news.js`
- `apps/desktop/tests/launch.spec.ts`
- `tests/integration/`
- `docs/design/`
- `docs/governance/third-party-registry.md`

## 15. Design acceptance criteria

- Warm editorial desktop visual direction is explicit and prohibited AI-template motifs are excluded.
- App Shell, primary/secondary navigation, inspector, and command bar are defined.
- Modules 03–06 each have information architecture, core screens, states, permission behavior, and data boundaries.
- Software development remains inside 04 Project Practice and protected-path rules are explicit.
- The design supports focused tests, Electron E2E, and visual verification.
- No production UI code or unreviewed dependency is authorized by this document.

## 16. Review decisions requested

Please review and confirm:

1. Warm editorial visual system and four-region shell dimensions.
2. Enabling 03–06 only through real snapshots and typed IPC slices.
3. Three-plan decomposition and order: shell → 03/04 → 05/06.
4. Inspector open at 1440px and collapsed below 1180px.
5. First high-fidelity prototype set: App Shell, English overview, Software Project, Knowledge Inbox, AI Today.
