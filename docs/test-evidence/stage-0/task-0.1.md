# Task 0.1 verification evidence

- Date: 2026-09-05
- Base: `56e3e91`
- Worktree: `C:/Users/Tong/Documents/ChatGPT/uniforge-stage-0`

| Command | Exit | Result |
|---|---:|---|
| `npm install --package-lock-only --ignore-scripts` | 0 | Lockfile generated from pinned dependencies |
| `npm ci --ignore-scripts` | 0 | 601 packages installed; npm audit reports 24 advisories for follow-up |
| `npm run check-baseline` | 0 | Required baseline files and strict mode detected |
| `npm run check-boundaries` | 0 | Core boundary scan passed |
| `npm run typecheck` | 0 | TypeScript strict project passed |
| `npm run lint` | 0 | ESLint passed |
| `npm run unit -- tests/engineering/baseline.test.ts tests/architecture/dependency-boundaries.test.ts` | 0 | 2 files / 2 tests passed; negative fixture detected forbidden import |
| `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts` | blocked | Historical pre-fix attempt timed out before deterministic build; current post-fix run still times out after 30 seconds with no Electron stderr |

Observed environment: Node `v24.18.0`, npm `11.16.0`. `npm run build:desktop` exits 0 and emits `apps/desktop/dist/main/index.js`, `preload/index.js`, and renderer HTML. The Electron smoke was started with `_electron.launch` and downloaded the Electron binary; the environment timed out before a completed test result, so it remains BLOCKED pending a fresh bounded run.

`npm audit --omit=optional --json` observed 24 advisories: 3 low, 20 high, 1 critical. The critical/high chain is transitive through Electron Forge 7.11.2 (`tar`, `extract-zip`, `@electron/rebuild`); npm offers Forge 6.4.2 as a major downgrade. No blind fix was applied. Residual risk is accepted for this development-only baseline and must be remediated before packaging/release; no production installer is shipped here.

The smoke limitation is recorded explicitly; no success state is fabricated. Forge configuration includes the pinned Squirrel maker for the later packaging gate. Final bounded smoke invocation after formatting: `npm run build:desktop` exited 0; `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts` exited 1 after the 30-second Playwright timeout, with no Electron stderr emitted and compiled outputs present under `apps/desktop/dist`. This is retained as an environment/runtime launch blocker.
