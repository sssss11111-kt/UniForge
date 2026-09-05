# Task 0.14 — Sidecar Host and capability PoC evidence

Date: 2026-09-05  
Status: automated protocol PoC PASS; live OCR/Speech/Document engines BLOCKED pending approved runtimes, model assets, and license review.

## Scope

The host uses versioned JSON Lines over stdio, fixed manifest executable/argv, bounded messages and deadlines, cancellation, health/version lifecycle, shutdown, and crash removal. The supervisor disables shell interpretation and limits inherited environment to `PATH`. OCR, Speech, and Document adapters are explicitly unprovisioned placeholders; they do not claim extraction success or download assets.

## Verification

Commands run from `C:/Users/Tong/Documents/ChatGPT/New project`:

- `npm run typecheck` — exit 0
- `npm run unit -- packages/platform-sidecar/host.test.ts tests/integration/sidecar-protocol.test.ts tests/recovery/sidecar-crash.test.ts tests/security/sidecar-scopes.test.ts` — exit 0
- `npm run check-boundaries` — exit 0
- `npm run check-doc-links` — exit 0

The live engine run is intentionally not marked PASS because no reviewed engine/runtime is installed. Stage 0 therefore retains a visible BLOCKED item for real extraction quality checks and Windows engine validation.

## Rollback

Stop the host and disable the sidecar manifest. Managed engine directories may be removed only after exact path validation; user Python environments and model caches are outside this change.
