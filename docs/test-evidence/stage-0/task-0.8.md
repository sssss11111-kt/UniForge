# Stage 0 Task 0.8 — Provider-neutral Model Gateway

## Scope

Implemented portable model contracts, six-level route resolution, budget reservation, provider adapters for OpenAI-compatible and Anthropic Messages request shapes, cancellation/error handling, and secret boundary utilities. The gateway owns provider/model metadata and returns `null` when cost is unknown. Missing non-fallback routes fail instead of silently switching providers.

## Validation evidence

- `npm run typecheck` — passed.
- `npm run unit -- packages/platform-model/router.test.ts packages/platform-model/gateway.test.ts tests/security/model-egress.test.ts` — 3 files / 5 tests passed.
- `npm run poc:model` — this repository has no authorized endpoint or credential configured; reports `BLOCKED` and sends no network request.

## Security and limits

`SecretHandle` rejects stringification/JSON serialization. `redactSecrets` removes credential-shaped fields before logs. The Windows Credential Manager class reports unavailable when the native adapter is not present; it does not fall back to ordinary files or SQLite. The network PoC requires explicit operator-provided endpoint authorization and synthetic input.
