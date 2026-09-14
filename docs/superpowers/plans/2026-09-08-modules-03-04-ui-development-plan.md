# Modules 03-04 UI Implementation Plan

> **For agentic workers:** Use subagent-driven development or executing-plans task by task. Do not enable a module before its typed snapshot and IPC slice exists.

**Goal:** Implement real Renderer vertical slices for 03 English Preparation and 04 Project Practice on the approved UI V2 shell.

**Architecture:** Domain Core and existing Stage 2/5 services remain truth. Add typed snapshot/command IPC only where missing, then render module views through Preload adapters. English and Project UIs never write domain tables directly and never expose unrestricted filesystem or model APIs.

**Tech Stack:** Existing TypeScript monorepo, vanilla ES modules/CSS, Electron, Vitest, Playwright, no new production dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-uniforge-ui-v2-modules-03-06-design.md`; Stage specs under `docs/specs/stage-2/` and `docs/specs/stage-5/`.

## Global constraints

- English uses one shared `VocabularyEntry` identity across CET4/CET6/IELTS.
- Project Agents access only explicitly authorized project workspaces.
- UniForge source, installation, updater, migration, permission, and build/signing paths are protected.
- AI output is proposal/evidence based; no fake success.
- Renderer uses only typed Preload APIs.

### Task 1: Contracts and snapshot inventory

Files: `packages/contracts/ipc/dto.ts`, `packages/contracts/ipc/api.ts`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/main/ipc/register.ts`, `tests/integration/modules-03-04-contract.test.ts`.
Map existing Stage 2/5 DTOs and add missing snapshot/command types. Write failing tests for channel names, payload validation, and frozen Preload surface.
Verify: `npx vitest run tests/integration/modules-03-04-contract.test.ts`; `npm run typecheck`.
Commit: `feat(ui): define modules 03-04 IPC contracts`.

### Task 2: English Overview vertical slice

Files: `apps/desktop/src/renderer/modules/english.js`, `apps/desktop/src/renderer/index.html`, `apps/desktop/src/renderer/app.js`, `apps/desktop/src/renderer/app.css`, `apps/desktop/tests/english-overview.spec.ts`, `tests/integration/english-ui-adapter.test.ts`.
Implement exam-space selector, days-to-exam, review load, weak dimensions, next action with reason, empty/offline/error/read-only states. Enable route only after real snapshot works.
Verify focused Vitest and Playwright.
Commit: `feat(ui): add English overview slice`.

### Task 3: English vocabulary and IELTS workspace

Files: `apps/desktop/src/renderer/modules/english.js`, `packages/contracts/ipc/api.ts`, `apps/desktop/src/preload/index.ts`, `apps/desktop/src/main/ipc/register.ts`, tests/evidence paths.
Implement dimension review and IELTS tabs using existing Vocabulary/IELTS services. Import/sync shows source/license/count before write; no unverified bundled content.
Verify focused tests, E2E, boundaries.
Commit: `feat(ui): add English study workspace`.

### Task 4: Project Overview and task flow

Files: `apps/desktop/src/renderer/modules/projects.js`, related contracts/IPC/preload, `apps/desktop/tests/project-overview.spec.ts`, integration tests.
Implement project type, goal, milestone, task list, approvals, evidence and authorized workspace summary. Mutations use typed commands.
Commit: `feat(ui): add project overview slice`.

### Task 5: Software project workspace

Files: `apps/desktop/src/renderer/modules/projects.js`, `packages/contracts/project/*`, IPC/preload, tests/security and E2E.
Implement file tree, editor placeholder surface, test/terminal evidence, Git status and Project AI inspector. Each operation displays canonical root, scope, reason, approval, diff and test outcome. No arbitrary shell/fs APIs.
Commit: `feat(ui): add authorized software workspace slice`.

### Task 6: Knowledge-safe cross-module relations

Files: `packages/contracts/ipc/*`, renderer modules, integration tests.
Expose relations among English, Project, Content, Artifact and AgentRun through IDs/references only; do not duplicate canonical bodies.
Commit: `feat(ui): add cross-module relation views`.

### Task 7: Full validation and acceptance

Files: `apps/desktop/tests`, `tests/integration`, `docs/test-evidence/stage-2`, `docs/test-evidence/stage-5`, `docs/design`.
Run format, typecheck, lint, unit, integration, boundary, doc-link, build and E2E gates. Record unavailable Windows VM gates honestly. Commit acceptance evidence; request user acceptance before closing modules.

## Acceptance criteria

- 03 and 04 have real snapshots, typed Preload/IPC, visible states, and tested vertical slices.
- Project protected-path rules remain enforced.
- No 07 route appears.
- No production dependency is added without registry review.
- All applicable repository gates pass and evidence is recorded.
