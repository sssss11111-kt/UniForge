# UniForge UI Design System V2 + App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark, single-column Renderer shell with the approved warm editorial Design System V2 and a typed, accessible four-region App Shell that can host modules 00–06 without inventing business data or bypassing Electron boundaries.

**Architecture:** Keep the existing vanilla Renderer architecture for this slice; split presentation into focused ES modules and CSS layers rather than adding a framework or production dependency. The Renderer consumes only the already exposed `window.uniforge` snapshot APIs through a small view-model adapter. Navigation is configuration-driven, while module pages remain disabled until their real snapshot and typed IPC slice are available. Domain state continues to flow through Preload → validated IPC → Application Service → SQLite/projection.

**Tech Stack:** Electron 44, vanilla ES modules, HTML, CSS, TypeScript/Vitest for tests, Playwright Electron tests, npm workspaces. No new production dependency.

**Spec:** `docs/superpowers/specs/2026-09-07-uniforge-ui-v2-modules-03-06-design.md`

## Global Constraints

- Warm editorial visual direction: canvas `#F4EFE7`, surface `#FFFDF9`, text `#22201D`, border `#282521`, accent `#D98A52`; no purple-blue gradients, neon, glow, glassmorphism, aurora, sparkle, robot avatars, or giant Ask AI buttons.
- App Shell regions are primary navigation `76px` (collapsible to `64px`), secondary navigation `216px`, flexible main work area, inspector/status `288px` at 1440px and collapsible below 1180px, and command bar `64px`.
- Primary entries are exactly `00 总览`, `01 Agent 执行中心`, `02 课内学习`, `03 英语备考`, `04 项目实践`, `05 知识与情报`, `06 AI 新闻`; there is no `07 开发区`.
- Renderer is presentation only. It must not import Electron, Node.js, SQLite, LangGraph, provider SDKs, secrets, or arbitrary filesystem APIs.
- Domain objects remain in Domain Core/SQLite. Renderer view models are transient projections and must not become a second source of truth.
- Protected UniForge source, installation, updater, migrations, permission kernel, and build/signing infrastructure are never exposed as project capabilities.
- Every visible operation has explicit loading, empty, error, offline, read-only, permission-denied, approval-required, and success states where applicable; Agent surfaces additionally expose running, waiting approval, paused, failed, cancelled, completed.
- Use only existing dependencies until `docs/governance/third-party-registry.md` is updated and the dependency is approved.
- Do not enable modules 03–06 merely because navigation exists; each requires a real snapshot and typed IPC slice.

---

## File Map and Ownership

Create the following focused Renderer files:

- `apps/desktop/src/renderer/ui/tokens.css` — Design System V2 custom properties, typography, spacing, radii, focus and motion rules.
- `apps/desktop/src/renderer/ui/components.js` — pure DOM component functions: `el`, `button`, `statusBadge`, `emptyState`, `errorState`, `permissionNotice`, `approvalCard`, `inspectorPanel`, `sourceBadge`, `taskRow`, `agentRunTimeline`, `offlineBanner`.
- `apps/desktop/src/renderer/ui/layout.js` — `createAppShell`, `renderPrimaryNav`, `renderSecondaryNav`, `renderBreadcrumbs`, `renderObjectHeader`, `renderCommandBar`.
- `apps/desktop/src/renderer/ui/state.js` — state normalization and state-to-view helpers; no IPC calls.
- `apps/desktop/src/renderer/ui/navigation.js` — navigation registry and route selection; no business mutation.
- `apps/desktop/src/renderer/modules/overview.js` — overview snapshot adapter/view.
- `apps/desktop/src/renderer/modules/agent-center.js` — Agent run/approval snapshot adapter/view.
- `apps/desktop/src/renderer/modules/course.js` — existing course controls migrated into the new shell.
- `apps/desktop/src/renderer/modules/english.js` — disabled roadmap shell and future typed snapshot adapter boundary.
- `apps/desktop/src/renderer/modules/projects.js` — disabled roadmap shell and future typed snapshot adapter boundary.
- `apps/desktop/src/renderer/modules/knowledge.js` — disabled roadmap shell and future typed snapshot adapter boundary.
- `apps/desktop/src/renderer/modules/news.js` — disabled roadmap shell and future typed snapshot adapter boundary.
- `apps/desktop/src/renderer/ui/view-models.js` — documented, runtime-validated shapes for shell data; no domain writes.

Modify these existing files:

- `apps/desktop/src/renderer/index.html` — semantic shell mounts and only stable static metadata.
- `apps/desktop/src/renderer/app.js` — bootstrap, snapshot loading, routing, error boundary, and event delegation.
- `apps/desktop/src/renderer/app.css` — layer imports and compatibility styles while legacy controls are migrated.
- `apps/desktop/src/preload/index.ts` — only when a missing typed snapshot method is proven necessary; preserve minimal frozen API.
- `apps/desktop/tests/launch.spec.ts` — replace outdated route expectations with shell/accessibility/security assertions.
- `tests/integration/ui-shell-contract.test.ts` — integration coverage for view-model and navigation contract.
- `docs/design/2026-09-07-ui-v2-app-shell-acceptance.md` — visual and interaction evidence.
- `docs/governance/third-party-registry.md` — only if a dependency is proposed; default plan adds none.

Do not delete the existing renderer until the migrated flow passes focused, integration, and Electron tests. Preserve a Git checkpoint before each broad migration.

---

### Task 1: Baseline the existing Renderer contract

**Files:**
- Create: `tests/integration/ui-shell-contract.test.ts`
- Modify: `apps/desktop/tests/launch.spec.ts`
- Inspect only: `apps/desktop/src/renderer/index.html`, `apps/desktop/src/renderer/app.js`, `apps/desktop/src/renderer/app.css`, `apps/desktop/src/preload/index.ts`

**Interfaces:**
- Consumes: existing `window.uniforge` methods `appShell()`, `settings.getSnapshot()`, `dashboard.getSnapshot()`, `agentCenter.getSnapshot()`, `knowledge.getSnapshot()`, `news.getSnapshot()`, `project.getSnapshot()`.
- Produces: test fixtures asserting the current public boundary and a migration safety net.

- [ ] **Step 1: Write failing contract tests**

```ts
import { describe, expect, it } from 'vitest';

describe('UI shell migration contract', () => {
  it('keeps the seven primary module ids and excludes the removed development area', () => {
    const ids = ['overview', 'agent-center', 'course', 'english', 'projects', 'knowledge', 'news'];
    expect(ids).toHaveLength(7);
    expect(ids).not.toContain('development');
  });

  it('keeps roadmap modules disabled until a typed snapshot exists', () => {
    const available = new Set(['overview', 'agent-center', 'course']);
    expect(available.has('english')).toBe(false);
    expect(available.has('projects')).toBe(false);
    expect(available.has('knowledge')).toBe(false);
    expect(available.has('news')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused test to establish the baseline**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`

Expected: PASS for the invariant fixture; existing `npm run e2e-smoke` remains the pre-migration safety check and must be recorded before changing markup.

- [ ] **Step 3: Record baseline evidence**

Run: `npm run typecheck`; `npm run unit`; `npm run e2e-smoke`

Save command output and the current screenshot under `docs/test-evidence/ui-v2-baseline/` (create the directory only through the normal test/evidence workflow). Record known failures explicitly; do not weaken assertions.

- [ ] **Step 4: Commit the safety net**

```bash
git add tests/integration/ui-shell-contract.test.ts apps/desktop/tests/launch.spec.ts docs/test-evidence/ui-v2-baseline
git commit -m "test: baseline renderer shell contract"
```

Rollback: revert this checkpoint only if the baseline test itself is incorrect; do not revert unrelated user changes.

---

### Task 2: Add the V2 tokens and global CSS foundation

**Files:**
- Create: `apps/desktop/src/renderer/ui/tokens.css`
- Modify: `apps/desktop/src/renderer/app.css`
- Modify: `apps/desktop/src/renderer/index.html`
- Test: `tests/integration/ui-shell-contract.test.ts`

**Interfaces:**
- Consumes: no runtime data.
- Produces: CSS custom properties and global selectors consumed by every component: `--uf-canvas`, `--uf-surface`, `--uf-text`, `--uf-muted`, `--uf-border`, `--uf-accent`, `--uf-focus`, `--uf-space-*`, `--uf-radius-*`, `--uf-primary-width`, `--uf-secondary-width`, `--uf-inspector-width`, `--uf-command-height`.

- [ ] **Step 1: Write a failing token contract test**

```ts
it('defines the approved warm editorial tokens in the source stylesheet', async () => {
  const css = await readFile('apps/desktop/src/renderer/ui/tokens.css', 'utf8');
  expect(css).toContain('--uf-canvas: #F4EFE7');
  expect(css).toContain('--uf-surface: #FFFDF9');
  expect(css).toContain('--uf-accent: #D98A52');
  expect(css).toContain('--uf-primary-width: 76px');
  expect(css).toContain('--uf-inspector-width: 288px');
});
```

- [ ] **Step 2: Run it and verify it fails because the file is absent**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts -t "defines the approved"`

Expected: FAIL with missing file/token.

- [ ] **Step 3: Implement the tokens and global layout primitives**

`tokens.css` must define the exact colors and dimensions above, Segoe UI/Microsoft YaHei UI fallback stacks, 4/8/12/16/24/32/48 spacing, 6px control and 8px panel radii, visible `:focus-visible`, and `@media (prefers-reduced-motion: reduce)`. `app.css` imports tokens first and provides `body`, `button`, `input`, `textarea`, `select`, `.uf-sr-only`, `.uf-scroll`, and `.uf-disabled` styles.

- [ ] **Step 4: Run formatting and focused tests**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`; `npx prettier --check apps/desktop/src/renderer/ui/tokens.css apps/desktop/src/renderer/app.css apps/desktop/src/renderer/index.html tests/integration/ui-shell-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/renderer/ui/tokens.css apps/desktop/src/renderer/app.css apps/desktop/src/renderer/index.html tests/integration/ui-shell-contract.test.ts
git commit -m "feat(ui): add warm editorial design tokens"
```

Rollback: revert this commit; keep the Task 1 baseline checkpoint intact.

---

### Task 3: Implement typed, provider-neutral UI component primitives

**Files:**
- Create: `apps/desktop/src/renderer/ui/components.js`
- Create: `apps/desktop/src/renderer/ui/state.js`
- Create: `apps/desktop/src/renderer/ui/view-models.js`
- Modify: `tests/integration/ui-shell-contract.test.ts`

**Interfaces:**
- Consumes: plain view models only.
- Produces: pure functions with these signatures:

```js
export function el(tag, attributes = {}, children = []) {}
export function statusBadge({ label, tone = 'neutral', state }) {}
export function emptyState({ title, description, action }) {}
export function errorState({ title, message, diagnosticRef, retry }) {}
export function permissionNotice({ operation, scope, reason, approvalRequired }) {}
export function approvalCard({ id, operation, scope, reason, expiresAt, onApprove, onDeny }) {}
export function sourceBadge({ kind, verified }) {}
export function taskRow({ title, status, owner, deadline, evidenceCount }) {}
export function agentRunTimeline({ run, events }) {}
export function inspectorPanel({ title, content, open = true }) {}
export function normalizeState(snapshot) {}
```

Each function returns a DOM `HTMLElement`, never calls IPC, and uses `textContent` for untrusted strings. `normalizeState` returns one of `loading | empty | ready | error | offline | read-only | permission-denied | approval-required` plus an optional `message` and `diagnosticRef`.

- [ ] **Step 1: Add failing DOM/component tests**

```ts
it('renders untrusted labels as text and exposes status semantically', () => {
  const node = statusBadge({ label: '<script>', tone: 'running', state: 'running' });
  expect(node.textContent).toBe('<script>');
  expect(node.querySelector('script')).toBeNull();
  expect(node.getAttribute('role')).toBe('status');
});

it('renders approval scope and explicit actions', () => {
  const node = approvalCard({ id: 'a1', operation: 'write', scope: 'workspace/A', reason: 'task', expiresAt: '2026-09-07T10:00:00Z' });
  expect(node.textContent).toContain('workspace/A');
  expect(node.querySelector('[data-action="approve"]')).not.toBeNull();
  expect(node.querySelector('[data-action="deny"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts -t "renders"`

Expected: FAIL until the modules exist.

- [ ] **Step 3: Implement the minimal pure components and CSS class hooks**

Use semantic elements (`article`, `nav`, `button`, `ol`, `aside`), `aria-live` only for changing status, and never embed Electron or provider types. Add exact state classes in `app.css` for all normalized states.

- [ ] **Step 4: Run focused tests and lint**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`; `npx eslint apps/desktop/src/renderer/ui tests/integration/ui-shell-contract.test.ts`

Expected: PASS with no unsafe `innerHTML` or Node imports.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/renderer/ui tests/integration/ui-shell-contract.test.ts apps/desktop/src/renderer/app.css
git commit -m "feat(ui): add accessible renderer primitives"
```

Rollback: revert this component checkpoint without touching the old `app.js`.

---

### Task 4: Build the App Shell layout and navigation registry

**Files:**
- Create: `apps/desktop/src/renderer/ui/layout.js`
- Create: `apps/desktop/src/renderer/ui/navigation.js`
- Modify: `apps/desktop/src/renderer/index.html`
- Modify: `apps/desktop/src/renderer/app.css`
- Modify: `tests/integration/ui-shell-contract.test.ts`

**Interfaces:**
- Consumes: `navigationRegistry`, `createAppShell({ registry, activeRoute, onNavigate, inspectorOpen })`.
- Produces: `AppShell` DOM with `[data-region="primary"]`, `[data-region="secondary"]`, `[data-region="main"]`, `[data-region="inspector"]`, `[data-region="command"]`; route entries have `{ id, label, number, status, secondaryItems, render }`.

```js
export const navigationRegistry = Object.freeze([
  { id: 'overview', number: '00', label: '总览', status: 'available' },
  { id: 'agent-center', number: '01', label: 'Agent 执行中心', status: 'available' },
  { id: 'course', number: '02', label: '课内学习', status: 'available' },
  { id: 'english', number: '03', label: '英语备考', status: 'roadmap' },
  { id: 'projects', number: '04', label: '项目实践', status: 'roadmap' },
  { id: 'knowledge', number: '05', label: '知识与情报', status: 'roadmap' },
  { id: 'news', number: '06', label: 'AI 新闻', status: 'roadmap' },
]);
export function selectRoute(registry, id) {}
export function createAppShell(options) {}
```

- [ ] **Step 1: Write failing layout tests**

```ts
it('renders the four regions and command bar', () => {
  const shell = createAppShell({ registry: navigationRegistry, activeRoute: 'overview', onNavigate() {} });
  expect(shell.querySelector('[data-region="primary"]')).not.toBeNull();
  expect(shell.querySelector('[data-region="secondary"]')).not.toBeNull();
  expect(shell.querySelector('[data-region="main"]')).not.toBeNull();
  expect(shell.querySelector('[data-region="inspector"]')).not.toBeNull();
  expect(shell.querySelector('[data-region="command"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run focused test and confirm failure**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts -t "four regions"`

Expected: FAIL until layout functions are present.

- [ ] **Step 3: Implement layout and navigation**

Primary items use `aria-current="page"` only for the active route. Roadmap items use `disabled`, `aria-disabled="true"`, and a visible `路线图` label. Secondary nav renders only the active route's declared items. `createAppShell` keeps inspector collapsible and command bar quiet; it does not render a giant chat panel.

- [ ] **Step 4: Validate responsive and keyboard behavior**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`; `npx prettier --check apps/desktop/src/renderer/ui/layout.js apps/desktop/src/renderer/ui/navigation.js apps/desktop/src/renderer/index.html`; `npx eslint apps/desktop/src/renderer/ui`

Expected: PASS; tab order follows primary → secondary → main → inspector → command.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/renderer/ui/layout.js apps/desktop/src/renderer/ui/navigation.js apps/desktop/src/renderer/index.html apps/desktop/src/renderer/app.css tests/integration/ui-shell-contract.test.ts
git commit -m "feat(ui): add four-region app shell"
```

Rollback: revert to Task 3; the old markup remains recoverable until the migration task.

---

### Task 5: Add snapshot adapters and explicit state handling

**Files:**
- Modify: `apps/desktop/src/renderer/ui/state.js`
- Modify: `apps/desktop/src/renderer/ui/view-models.js`
- Create: `apps/desktop/src/renderer/modules/overview.js`
- Create: `apps/desktop/src/renderer/modules/agent-center.js`
- Create: `apps/desktop/src/renderer/modules/course.js`
- Create: `apps/desktop/src/renderer/modules/english.js`
- Create: `apps/desktop/src/renderer/modules/projects.js`
- Create: `apps/desktop/src/renderer/modules/knowledge.js`
- Create: `apps/desktop/src/renderer/modules/news.js`
- Modify: `tests/integration/ui-shell-contract.test.ts`

**Interfaces:**
- Consumes: injected `api` object matching the frozen Preload surface.
- Produces:

```js
export async function loadOverview(api) {} // Promise<{state, workspace, items, approvals, error?}>
export async function loadAgentCenter(api) {} // Promise<{state, runs, approvals, error?}>
export async function loadCourse(api) {} // Promise<{state, course, ...existingCourseSnapshots}>
export function roadmapModule({ id, label, secondaryItems }) {} // no IPC call, state='roadmap'
```

Adapters catch failures into `{ state: 'error', error: { message, diagnosticRef } }`; they do not fabricate successful snapshots. `knowledge`, `news`, and `project` may be called only by an enabled future route after their snapshot contract is approved; the initial route registry keeps them roadmap.

- [ ] **Step 1: Add failing adapter tests**

```ts
it('turns a rejected dashboard snapshot into a visible error state', async () => {
  const result = await loadOverview({ dashboard: { getSnapshot: async () => { throw new Error('DB_OFFLINE'); } } });
  expect(result.state).toBe('error');
  expect(result.error.message).toBe('DB_OFFLINE');
});

it('does not call IPC for a roadmap module', () => {
  const api = { knowledge: { getSnapshot: () => { throw new Error('must not call'); } } };
  expect(roadmapModule({ id: 'knowledge', label: '知识与情报', secondaryItems: [] }).state).toBe('roadmap');
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts -t "error state|roadmap module"`

Expected: FAIL until adapters exist.

- [ ] **Step 3: Implement adapters**

Use `Promise.all` only for independent read snapshots, preserve server-provided status and evidence, and map no-data snapshots to `empty`. Keep mutation handlers outside adapters and route them through existing Preload methods.

- [ ] **Step 4: Verify state matrix**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`; `npm run typecheck`; `npm run lint -- --quiet`

Expected: PASS; no direct `ipcRenderer`, `fetch`, Node import, or domain-table access under `apps/desktop/src/renderer`.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop/src/renderer/modules apps/desktop/src/renderer/ui/state.js apps/desktop/src/renderer/ui/view-models.js tests/integration/ui-shell-contract.test.ts
git commit -m "feat(ui): add snapshot adapters and honest states"
```

Rollback: revert adapters only; keep the shell primitives usable with test fixtures.

---

### Task 6: Migrate the bootstrap and existing 00–02 content into the shell

**Files:**
- Modify: `apps/desktop/src/renderer/app.js`
- Modify: `apps/desktop/src/renderer/index.html`
- Modify: `apps/desktop/src/renderer/app.css`
- Modify: `apps/desktop/src/renderer/modules/overview.js`
- Modify: `apps/desktop/src/renderer/modules/agent-center.js`
- Modify: `apps/desktop/src/renderer/modules/course.js`
- Modify: `apps/desktop/tests/launch.spec.ts`

**Interfaces:**
- Consumes: `createAppShell`, `navigationRegistry`, `loadOverview`, `loadAgentCenter`, `loadCourse`, and `window.uniforge`.
- Produces: one bootstrap function `startRenderer({ document, api = window.uniforge })` that mounts once, routes without full-page reload, and renders an error boundary when boot fails.

- [ ] **Step 1: Update Electron test assertions before migration**

Assert `getByTestId('app-shell')`, all four `[data-region]` regions, `00 总览` active, `03 英语备考` disabled with `路线图`, no `07`, `window.require/process/electron` undefined, and warm token styles computed on the body.

- [ ] **Step 2: Run the updated E2E test and confirm failure**

Run: `npx playwright test apps/desktop/tests/launch.spec.ts`

Expected: FAIL because the old shell does not expose the new regions/IDs.

- [ ] **Step 3: Implement bootstrap migration**

`startRenderer` loads only read snapshots, renders status/error/empty states, delegates clicks from `data-route`, and preserves existing course forms and approval/error wording. Any user mutation continues using existing typed `window.uniforge` methods. Do not add a fake module page or fake data for 03–06.

- [ ] **Step 4: Run focused Electron and security checks**

Run: `npx playwright test apps/desktop/tests/launch.spec.ts`; `npm run check-boundaries`; `npm run typecheck`; `npm run lint -- --quiet`

Expected: PASS; renderer boundary scan reports no forbidden imports/APIs.

- [ ] **Step 5: Commit the migration**

```bash
git add apps/desktop/src/renderer/app.js apps/desktop/src/renderer/index.html apps/desktop/src/renderer/app.css apps/desktop/src/renderer/modules apps/desktop/tests/launch.spec.ts
git commit -m "feat(ui): migrate desktop bootstrap to app shell v2"
```

Rollback: revert Task 6 and relaunch the previous shell; do not delete the new component files.

---

### Task 7: Add visual, accessibility, and responsive verification

**Files:**
- Modify: `apps/desktop/tests/launch.spec.ts`
- Create: `apps/desktop/tests/ui-shell.visual.spec.ts`
- Create: `docs/design/2026-09-07-ui-v2-app-shell-acceptance.md`
- Modify: `playwright.config.ts` only if a stable screenshot path is required

**Interfaces:**
- Consumes: packaged/dev Electron Renderer and the shell routes.
- Produces: deterministic screenshot evidence for 1440×900 and 1280×800, keyboard traversal checks, reduced-motion checks, and visual acceptance notes.

- [ ] **Step 1: Write failing visual/accessibility checks**

```ts
test('shell fits target desktop viewport and keeps inspector collapsible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('[data-region="inspector"]')).toBeVisible();
  await expect(page.locator('[data-region="command"]')).toHaveCSS('height', '64px');
  await expect(page).toHaveScreenshot('ui-v2-app-shell-1440.png', { animations: 'disabled' });
});

test('keyboard focus reaches route, inspector, and command controls', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toBeVisible();
  await expect(page.getByRole('button', { name: /英语备考/ })).toBeDisabled();
});
```

- [ ] **Step 2: Run and confirm baseline failure**

Run: `npx playwright test apps/desktop/tests/ui-shell.visual.spec.ts`

Expected: FAIL until shell migration and stable screenshot baseline are complete.

- [ ] **Step 3: Implement test fixtures and visual evidence**

Use only deterministic local snapshots and disable animations. Check 1440×900 inspector open, 1280×800 inspector still usable/collapsible, below 1180px collapsed behavior, focus ring, disabled roadmap labels, color contrast, no horizontal overflow, and reduced motion.

- [ ] **Step 4: Capture and review screenshots**

Run: `npx playwright test apps/desktop/tests/ui-shell.visual.spec.ts --update-snapshots` only after the implementation is stable; then rerun without `--update-snapshots`. Save review notes to `docs/design/2026-09-07-ui-v2-app-shell-acceptance.md` with viewport, commit, command, and observed result.

- [ ] **Step 5: Commit evidence and tests**

```bash
git add apps/desktop/tests/ui-shell.visual.spec.ts apps/desktop/tests/launch.spec.ts docs/design/2026-09-07-ui-v2-app-shell-acceptance.md playwright.config.ts
git commit -m "test(ui): verify shell visual and accessibility baseline"
```

Rollback: revert screenshot/evidence changes only if the baseline was captured from a non-deterministic run; retain the test and fix the fixture.

---

### Task 8: Run the complete shell gate and record acceptance

**Files:**
- Modify: `docs/design/2026-09-07-ui-v2-app-shell-acceptance.md`
- Modify: `docs/governance/third-party-registry.md` only if dependencies changed
- Modify: `docs/superpowers/specs/2026-09-07-uniforge-ui-v2-modules-03-06-design.md` only if an approved design decision changed

**Interfaces:**
- Consumes: all shell code and evidence from Tasks 1–7.
- Produces: complete acceptance record and a coherent Git checkpoint ready for the next plan (Modules 03–04).

- [ ] **Step 1: Run focused gates**

Run: `npx vitest run tests/integration/ui-shell-contract.test.ts`; `npx playwright test apps/desktop/tests/launch.spec.ts apps/desktop/tests/ui-shell.visual.spec.ts`.

- [ ] **Step 2: Run repository gates**

Run: `npm run format:check`; `npm run typecheck`; `npm run lint -- --quiet`; `npm run unit`; `npm run integration`; `npm run check-boundaries`; `npm run check-doc-links`; `npm run build:desktop`.

Expected: every applicable command passes. If a Windows package or VM check is unavailable, record it as unavailable with the exact command and reason; never mark it passed.

- [ ] **Step 3: Review security and source-of-truth boundaries**

Search: `rg -n "from ['\"](electron|node:)|ipcRenderer|innerHTML|fetch\(" apps/desktop/src/renderer`

Expected: no forbidden renderer access; any `innerHTML` must be absent. Confirm no `07 开发区` string or route exists.

- [ ] **Step 4: Record acceptance**

The acceptance document must include commit SHA, commands and outcomes, screenshots, known limitations, and the statement that 03–06 remain roadmap until their typed snapshots are implemented. It must not claim Windows VM, Sidecar, signing, or production release completion.

- [ ] **Step 5: Commit the gate record**

```bash
git add docs/design/2026-09-07-ui-v2-app-shell-acceptance.md
git commit -m "docs(ui): record app shell v2 acceptance"
```

Rollback: use the last passing checkpoint before the failed task; do not reset shared history. A failed gate blocks progression to the Modules 03–04 plan until fixed.

---

## Acceptance Criteria

The UI Design System V2 + App Shell slice is accepted only when all of the following have evidence:

1. The Renderer uses the approved warm editorial tokens, typography, borders, spacing, radii, focus behavior, and reduced-motion behavior.
2. The App Shell has primary navigation, secondary navigation, main work area, inspector/status panel, and command bar with the specified dimensions and responsive behavior.
3. Primary navigation exposes exactly 00–06 and contains no 07 development route; 03–06 are visibly disabled roadmap entries until enabled by their own typed snapshot/IPC implementation.
4. Shared states include loading, empty, error, offline, read-only, permission denied, approval required, success, and the Agent lifecycle states required by the spec.
5. Renderer code has no direct Electron, Node.js, SQLite, provider SDK, secret, arbitrary filesystem, or shell access; all data comes from the frozen Preload API.
6. Existing 00–02 behavior and mutation boundaries remain covered by focused tests and Electron smoke tests.
7. Visual evidence passes at 1440×900 and 1280×800, with keyboard navigation, focus rings, semantic landmarks, and no horizontal overflow.
8. `npm run format:check`, `npm run typecheck`, `npm run lint -- --quiet`, `npm run unit`, `npm run integration`, `npm run check-boundaries`, `npm run check-doc-links`, and `npm run build:desktop` pass, with any unavailable environment gate recorded honestly.
9. Each task has a coherent Git checkpoint, and the last passing checkpoint can be used to recover without destructive reset.
10. No new production dependency is introduced without a third-party registry entry and explicit approval.

## Self-Review

- Spec coverage: Sections 1–3 and 5–6 are implemented by Tasks 2–6; state matrix and accessibility are covered by Tasks 3, 5, and 7; data/security boundaries are covered by Tasks 5, 6, and 8; implementation decomposition and acceptance are covered throughout.
- Module coverage: 03–06 receive explicit roadmap adapters and route contracts in Task 5. Their full business implementations belong to the subsequent Modules 03–04 and 05–06 plans, as required by the design specification.
- Placeholder scan: no `TBD`, `TODO`, or unspecified dependency appears in the task requirements; every task names files, interfaces, tests, commands, and checkpoints.
- Type consistency: all later tasks consume the exact exports from Tasks 3–5 (`createAppShell`, `navigationRegistry`, `loadOverview`, `loadAgentCenter`, `loadCourse`, `roadmapModule`, `startRenderer`).

