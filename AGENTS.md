# AGENTS.md — UniForge repository instructions

Follow the canonical product specification at `docs/specs/2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md` and the approved master development plan at `docs/superpowers/plans/2026-09-05-uniforge-v2.1-complete-development-plan-with-ui.md`.

This file contains repository-wide execution rules only. Keep detailed product prose, architecture explanations, UI specifications, stage plans, test evidence, ADRs, and dependency reviews in their owning `docs/` directories. Do not duplicate those documents into this file.

## Respect the source-of-truth hierarchy

Use this order when instructions conflict:

1. Explicit current user instruction.
2. This root `AGENTS.md`.
3. Approved product and architecture specification.
4. Approved current-stage specification and implementation plan.
5. ADRs and domain contracts.
6. Existing implementation details.

Do not silently reinterpret a higher-level requirement to fit existing code.

If a requested change contradicts the approved specification or current stage boundary, stop implementation and surface the conflict before changing code.

## Follow the stage gates

UniForge development proceeds in this order:

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

Do not skip a stage gate.

Do not begin Stage 1 implementation until Stage 0 is accepted and Stage 0.5 Design System / core prototypes are approved.

Do not pre-implement later-stage business logic merely because later navigation or design already exists. Roadmap UI must not pretend unfinished functionality works.

Each stage must produce its own approved specification, technical design, data model, permission matrix, implementation plan, tests, acceptance evidence, Git checkpoint, and rollback notes.

## UniForge must never develop itself inside the app

There is no `07 开发区`.

Never add an application feature, Agent tool, hidden command, plugin permission, MCP tool, terminal path, or approval flow that allows the running UniForge application to modify:

- the UniForge source repository;
- the installed application directory;
- updater binaries or update logic;
- core database migration implementation;
- the permission/security kernel;
- release/signing/build infrastructure for UniForge itself.

UniForge source development happens outside the running product through the normal repository workflow: specification → isolated branch/worktree → implementation → tests → review → build/sign → release.

User software-development capability belongs only under `04 项目实践 → 软件项目`.

Project Agents may modify only the explicitly authorized project working copy. Approval must never be offered as a way to bypass the UniForge protected-path boundary.

## Keep business truth in the Domain Core

UniForge owns its domain model.

Agents, LangGraph, MCP servers, connectors, UI components, sidecars, and model providers must not become the source of truth for business state.

The required write path is:

```text
Agent / UI / Connector
↓
Proposal or typed Domain Command
↓
Permission check
↓
Approval when required
↓
Domain Service
↓
Database transaction
↓
Domain Event
↓
Projection / UI update
```

Never let an Agent write domain tables directly.

Do not import framework-specific runtime types into domain packages.

LangGraph state and checkpoints are runtime execution state only. They are never Course, Task, Project, Content, Vocabulary, Approval, Artifact, or other domain truth.

Simple AI operations may use the Native Runtime path. Do not route every model call through LangGraph merely because LangGraph exists.

## Preserve one source of truth per object

Follow these ownership rules:

- UniForge domain objects → UniForge SQLite / Domain Core.
- Normal imported files → UniForge managed workspace copy.
- Git project history → Git.
- Obsidian official notes → Markdown in the selected Vault.
- Personal long-term memory → Personal Core.
- Agent run history → UniForge Agent Event Store.
- API keys and secrets → operating-system secure credential storage.
- Search indexes, vector indexes, caches, projections, and runtime checkpoints → rebuildable derived state.

Do not create multiple independent canonical copies of the same content.

A `ContentEntity` may appear in many views through relations; do not duplicate its canonical body for Inbox, Source, Topic, Course, Project, News, or Obsidian views.

Keep `Remove Relation`, `Delete`, and `Forget` as different operations.

## Keep conversation, knowledge, and memory separate

A conversation is not automatically long-term memory.

Use the memory admission flow:

```text
Conversation
↓
Receipt
↓
Evidence
↓
Memory Candidate
↓
Conflict / scope / authorization checks
↓
Memory Claim
↓
Outcome
```

Every durable claim must retain provenance.

Forgetting a memory must also remove or invalidate derived indexes and caches that depend on it.

Vector search is an optimization, not truth.

## Enforce least privilege

Every Agent and Tool receives only the permissions required for the current subtask.

Temporary grants expire when the task ends.

Permission expansion requires a new decision.

Treat at least the following as high risk:

- destructive deletion;
- external transmission;
- user-project source modification;
- database mutation outside a normal domain command;
- `git push`;
- sending messages or mail;
- meaningful cost expansion;
- changing model/provider when sensitive data will leave the device.

A denied or unavailable permission must fail visibly. Never replace a denied operation with a hidden workaround.

## Protect filesystem boundaries

All filesystem access must resolve to canonical authorized paths before use.

Reject traversal, symlink, junction, or equivalent escapes outside the approved workspace.

Project A must not read or modify Project B unless explicitly granted through a supported product flow.

Protected paths include the UniForge installation, detected UniForge source tree, updater resources, credential storage, unrelated workspaces, and other user directories not explicitly authorized.

Do not expose unrestricted `fs`, shell, process, or arbitrary-path APIs to the Renderer.

## Keep the Electron boundary narrow

Renderer is presentation only.

Renderer must not directly access:

- Node.js;
- SQLite;
- filesystem APIs;
- credentials;
- shell/process execution;
- arbitrary IPC channels.

Expose only minimal typed APIs through Preload.

Validate all IPC input in the trusted process. Unknown channels and invalid payloads must fail closed.

## Keep Model Gateway provider-neutral

Domain code and Agents use UniForge Model Gateway contracts rather than provider SDKs directly.

Model routing follows the approved hierarchy:

```text
Single Run
→ Agent Preset
→ Course / Project
→ Module
→ Global
→ Fallback
```

Do not let LangGraph or another runtime own API keys, pricing rules, model catalog, budget policy, or provider routing.

Never write API keys, cookies, auth tokens, or Git credentials to ordinary configuration, SQLite domain tables, logs, backups, fixtures, or Git.

If actual cost is unknown, record usage without inventing a monetary value.

## Route tools through Tool Gateway

Agent tools must use the UniForge Tool Gateway.

Supported tool families may include internal tools, MCP, local CLI, HTTP API, connectors, plugins, and project-development tools.

MCP is an external tool/connector protocol. Do not use MCP as a replacement for typed internal Domain Service contracts.

Every production tool must declare its capabilities, schemas, filesystem/network/credential scopes, risk, approval policy, timeout/resource limits, version, and license.

Tool failure, timeout, cancellation, disconnect, or malformed output must remain visible in the run record.

## Keep heavy capabilities isolated

OCR, speech, complex document parsing, sandbox execution, and similar heavy capabilities should run behind replaceable Sidecar contracts when required by the approved architecture.

A Sidecar must be independently startable, stoppable, health-checkable, cancellable, versioned, and restartable.

A Sidecar crash must not crash the entire desktop application or become a reason to bypass permission checks.

## Follow the UI design gate

Stage 0.5 owns the Design System, information architecture, page specifications, state matrix, interaction rules, accessibility baseline, and approved prototypes.

Once Design System V1 is approved:

- implement from the approved page/design specification;
- reuse shared tokens and components;
- do not invent a second visual language inside a module;
- do not recreate a removed `07 开发区`;
- keep software-development UI inside Project Practice;
- represent real Agent states such as running, waiting approval, paused, failed, cancelled, and completed;
- show evidence, permission scope, failures, and approval state where relevant;
- do not fake sync, Agent progress, model success, test success, or unavailable integrations.

Build each module as a vertical slice:

```text
Domain Contract
↓
Application Service
↓
IPC
↓
React implementation
↓
Integration test
↓
E2E
↓
Visual verification
```

Do not build every page first and postpone domain behavior until later.

## Keep third-party adoption explicit

Before adding a production dependency or bundled dataset, update `docs/governance/third-party-registry.md`.

Record repository, pinned version/commit, license, sub-license, model/data/assets licenses where relevant, commercial and redistribution constraints, Windows support, security notes, maintenance status, and approved integration level.

Use the approved adoption levels:

- A — direct integration;
- B — runtime / sidecar;
- C — external connector;
- D — product or architecture reference only;
- E — do not adopt.

A public GitHub repository is not automatically safe to copy, bundle, or redistribute.

Do not bundle unclear-license vocabulary, IELTS/Cambridge material, model assets, private platform data, or other unverified content.

## Develop with tests, evidence, and reversible Git history

Before modifying an existing flow, inspect the current implementation, tests, owning specification, and relevant ADRs.

For feature or bug-fix implementation:

1. define or confirm acceptance behavior;
2. write or identify a failing test;
3. verify the failure is meaningful;
4. implement the smallest correct change;
5. run the focused tests;
6. run related regression checks;
7. review security, permissions, migrations, and failure behavior when applicable;
8. save acceptance evidence;
9. commit a coherent change.

Use isolated branch/worktree development for non-trivial work.

Do not delete tests, weaken assertions, suppress failures, or change acceptance criteria merely to make an implementation pass.

Do not claim a command, build, migration, test, Agent run, connector, or external integration succeeded unless it actually ran and produced evidence.

## Keep failures honest and recoverable

Do not mask failures with mock data, hard-coded success states, stale cached success, or optimistic UI that never reconciles with reality.

Important state changes must be recoverable where the approved design requires it.

Preserve enough evidence to diagnose:

- failed Agent runs;
- tool failures;
- model failures;
- sidecar crashes;
- connector failures;
- database migration failures;
- project build/test failures.

A failed project build is not a completed task.

A partial Agent run is not a completed run.

## Validate before declaring work complete

Use the repository's canonical scripts from `package.json`, workspace configuration, and CI for the area changed.

At minimum, run every applicable gate already defined by the repository, including type checking, focused tests, related regression tests, integration/E2E checks, security checks, packaging checks, or license checks when those areas are affected.

If a required validation cannot run, state exactly what did not run and why. Do not substitute an assumption for test evidence.

After changing architecture, data ownership, permissions, IPC, runtime contracts, UI information architecture, or third-party adoption, update the corresponding canonical document or ADR in the same change.
