# Stage 1 Task 1.14 — Voice MVP

## Scope

This slice adds the minimum real Voice vertical path for global voice and
Agent input: typed STT/TTS contracts, a replaceable Speech sidecar boundary,
health and failure visibility, cancellation, permission checks, cloud approval,
incognito retention rules, typed Electron IPC/Preload methods, and a small
renderer state surface. The default desktop wiring reports the unprovisioned
speech runtime as `UNAVAILABLE`; it does not claim a successful transcription.

Raw audio is owned by the caller and is not persisted. Incognito sessions do
not retain transcript or synthesized audio in the Voice snapshot. Voice output
is not admitted to long-term memory or any domain table.

## Implementation evidence

- `packages/contracts/voice/index.ts` defines STT/TTS requests, session status,
  privacy flags, and the snapshot DTO.
- `packages/core/application/voice-service.ts` enforces `voice:use`, cloud
  approval, sidecar health, cancellation, failure states, and in-memory
  session projection only.
- `packages/platform-sidecar/speech.ts` adapts STT/TTS/health/cancel to the
  existing JSON-line SidecarHost boundary. `sidecars/speech/adapter.py`
  remains explicitly unavailable until a separately approved runtime exists.
- `apps/desktop/src/main/ipc/register.ts`, `apps/desktop/src/preload/index.ts`,
  and the renderer expose only typed Voice operations and visible status.

## Verification

Commands run from repository root:

```text
npx vitest run packages/core/application/voice-service.test.ts packages/platform-sidecar/host.test.ts tests/integration/sidecar-protocol.test.ts tests/security/sidecar-scopes.test.ts --config vitest.config.ts
4 files passed, 10 tests passed

npx tsc -b packages/contracts/tsconfig.json packages/core/tsconfig.json packages/platform-sidecar/tsconfig.json apps/desktop/tsconfig.build.json apps/desktop/tsconfig.preload.json --pretty false
passed
```

The focused tests cover unavailable sidecar behavior, cloud approval waiting,
completed STT, cancellation, sidecar failure, permission denial, and incognito
non-retention.
