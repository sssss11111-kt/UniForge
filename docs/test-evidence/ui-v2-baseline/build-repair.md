# UI V2 executable desktop baseline repair

Date: 2026-09-08

Build omitted renderer/ui entirely, so app.css referenced a missing tokens.css in dist. A regression test failed with ENOENT for dist/renderer/ui/tokens.css. Build now copies the renderer directory recursively and builds TypeScript project references. platform-agent package exports now select compiled dist/index.js instead of source TypeScript, consistent with other runtime packages.

Validation:

- desktop-build.test.ts: 1 passed after recorded ENOENT failure.
- npm run e2e-smoke: actual Electron launch test 1 passed, 4.7 seconds. The previously recorded launch timeout is resolved for this checkout.

No new dependency or IPC capability was added. This proves baseline launch, not V2 shell acceptance. Revert the dedicated build repair commit to restore previous build behavior; no user data migration occurs.
