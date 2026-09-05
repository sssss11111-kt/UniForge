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
| `npm run e2e-smoke -- apps/desktop/tests/launch.spec.ts` | blocked | Electron smoke requires a compiled desktop entry; no build script is included in Task 0.1 |

The smoke limitation is recorded explicitly; no success state is fabricated. Forge configuration includes the pinned Squirrel maker for the later packaging gate.
