# Task 0.1 verification evidence

- Date: 2026-09-05
- Base: `56e3e91`
- Worktree: `C:/Users/Tong/Documents/ChatGPT/uniforge-stage-0`

| Command                                                                                               |    Exit | Result                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ------: | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install --package-lock-only --ignore-scripts`                                                    |       0 | Lockfile generated from pinned dependencies                                                                                                    |
| `npm ci --ignore-scripts`                                                                             |       0 | 601 packages installed; npm audit reports 24 advisories for follow-up                                                                          |
| `npm run check-baseline`                                                                              |       0 | Required baseline files and strict mode detected                                                                                               |
| `npm run check-boundaries`                                                                            |       0 | Core boundary scan passed                                                                                                                      |
| `npm run typecheck`                                                                                   |       0 | TypeScript strict project passed                                                                                                               |
| `npm run lint`                                                                                        |       0 | ESLint passed                                                                                                                                  |
| `npm run unit -- tests/engineering/baseline.test.ts tests/architecture/dependency-boundaries.test.ts` |       0 | 2 files / 2 tests passed; negative fixture detected forbidden import                                                                           |
| `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts`                                              | blocked | Historical pre-fix attempt timed out before deterministic build; current post-fix run still times out after 30 seconds with no Electron stderr |

Observed environment: Node `v24.18.0`, npm `11.16.0`. `npm run build:desktop` exits 0 and emits `apps/desktop/dist/main/index.js`, `preload/index.js`, and renderer HTML. The Electron smoke was started with `_electron.launch` and downloaded the Electron binary; the environment timed out before a completed test result, so it remains BLOCKED pending a fresh bounded run.

`npm audit --omit=optional --json` observed 24 advisories: 3 low, 20 high, 1 critical. The critical/high chain is transitive through Electron Forge 7.11.2 (`tar`, `extract-zip`, `@electron/rebuild`); npm offers Forge 6.4.2 as a major downgrade. No blind fix was applied. Residual risk is accepted for this development-only baseline and must be remediated before packaging/release; no production installer is shipped here.

The smoke limitation is recorded explicitly; no success state is fabricated. Forge configuration includes the pinned Squirrel maker for the later packaging gate. Final bounded smoke invocation after formatting: `npm run build:desktop` exited 0; `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts` exited 1 after the 30-second Playwright timeout, with no Electron stderr emitted and compiled outputs present under `apps/desktop/dist`. This is retained as an environment/runtime launch blocker.

## Current verification checkpoint

- Commit: `69490bf` (`fix: complete task 0.1 foundation gates`)
- Date: 2026-09-05
- CWD: `C:/Users/Tong/Documents/ChatGPT/uniforge-stage-0`
- Runtime: Node `v24.18.0`, npm `11.16.0`, Electron `44.2.0`, Windows

The earlier timeout above is retained as historical evidence. The corrected checkpoint was rerun from a clean dependency install and completed successfully:

| Command                                                                                               | Exit | Result                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                                                                                              |    0 | 601 packages installed; npm reported 24 advisories (3 low, 20 high, 1 critical)                                                                                                       |
| `npm run typecheck`                                                                                   |    0 | TypeScript project-reference build passed for workspace, main, preload, and tests                                                                                                     |
| `npm run lint`                                                                                        |    0 | ESLint passed with generated `dist` outputs ignored                                                                                                                                   |
| `npm run format:check`                                                                                |    0 | Prettier passed for source, governance, workflow, and evidence paths                                                                                                                  |
| `npm run check-baseline`                                                                              |    0 | Required files, strict mode, lockfile, and required scripts detected                                                                                                                  |
| `npm run check-boundaries`                                                                            |    0 | Contracts/Core/Renderer boundary scan passed                                                                                                                                          |
| `npm run check-doc-links`                                                                             |    0 | 5 canonical document paths resolved                                                                                                                                                   |
| `npm run unit -- tests/engineering/baseline.test.ts tests/architecture/dependency-boundaries.test.ts` |    0 | 2 files / 10 tests passed, including strict/script fixtures and import-form fixtures                                                                                                  |
| `npm run test:group -- architecture`                                                                  |    0 | Explicit architecture group routing ran 1 file / 6 tests                                                                                                                              |
| `npm run build:desktop`                                                                               |    0 | Main ESM and sandbox-compatible CommonJS preload emitted under `apps/desktop/dist`                                                                                                    |
| `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts`                                              |    0 | Build plus real Electron launch passed 1/1; `nodeIntegration=false`, `contextIsolation=true`, `sandbox=true`, exact frozen preload surface, and absent Renderer Node globals verified |
| `npm audit --omit=optional --json`                                                                    |    1 | 24 advisories; Forge archive/cache/temp chains are triaged in `dependency-review.md`; no blind major downgrade applied                                                                |
