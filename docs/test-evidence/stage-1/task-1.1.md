# Stage 1 Task 1.1 — App Shell

## Scope

This checkpoint implements the first Stage 1 vertical slice for the desktop shell:

- Primary navigation exposes `00 总览`, `01 Agent 执行中心`, and `02 课内学习` as available modules.
- `03 英语备考`, `04 项目实践`, `05 知识与情报`, and `06 AI 新闻` remain visibly labelled as `路线图` and disabled.
- The shell keeps one active module and provides keyboard focus styling.
- Navigation state crosses the Electron boundary through the typed `appShell` IPC contract; the renderer receives no Node.js, filesystem, SQLite, or shell access.

## Files

- `packages/contracts/app-shell/navigation.ts` — module identifiers and shell DTO.
- `packages/contracts/ipc/dto.ts` and `packages/contracts/ipc/api.ts` — IPC channel and API contract.
- `apps/desktop/src/main/ipc/register.ts` — validated read-only shell handler.
- `apps/desktop/src/preload/index.ts` — minimal `appShell()` bridge.
- `apps/desktop/src/renderer/index.html`, `app.js`, `app.css` — shell presentation.
- `scripts/build-desktop.mjs` — copies renderer assets into the packaged output.

## Verification

Commands run:

```text
npm run typecheck
npm run lint
npm run e2e-smoke -- --grep "app shell"
```

Results:

- TypeScript project build passed.
- ESLint passed.
- Playwright App Shell smoke test passed: 1 test passed.

The test verifies the active overview state, all Stage 1 navigation entries, disabled roadmap entries, and the secure preload surface.

## Boundary notes

This task does not implement course business logic, Agent execution, settings, or later-stage modules. Roadmap entries cannot be activated and do not claim unavailable functionality.
