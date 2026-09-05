# UniForge UI Design Specification

Status: Draft. Design-only artifact; no production UI implementation is authorized by this document.

## Product frame

UniForge is a Windows-first, local-first object-centered workspace. The interface presents objects, tasks, evidence, permissions, and recoverable Agent runs. AI is a capability attached to context, not a universal chat replacement.

## App shell

Persistent shell: title bar, workspace switcher, primary navigation, command/search entry, content region, contextual inspector, status/diagnostics region. Navigation contains `00 总览`, `01 Agent 执行中心`, `02 课内学习`, `03 英语备考`, `04 项目实践`, `05 知识与情报`, and `06 AI 新闻`. There is no `07 开发区`.

## Required page states

Every page specifies loading, empty, error, offline, read-only, approval, success, and permission-denied states. Agent surfaces additionally specify running, paused, waiting approval, failed, cancelled, and completed.

## Design constraints

Use typed domain commands and real permission state in labels and actions. Never imply that a sync, model call, connector, approval, or Agent run succeeded without evidence. Keep destructive and external actions visibly gated.
