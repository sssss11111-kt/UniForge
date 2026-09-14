# Stage 1 Task 1.9 — Course Code Execution

## Scope

This slice adds a typed course execution request/result contract for compile,
run, test, and debug operations. Requests are restricted to a user-authorized
temporary workspace, require separate assignment execution and code execution
permissions, and require an approval token when the Tool Gateway marks the
operation high risk. The controlled runner uses a non-shell child process,
one process, captured stdout/stderr, timeout, cancellation, and explicit
failure states. Protected UniForge source, installation, updater, migration,
permission, and unrelated workspace paths are rejected.

The desktop boundary exposes execution snapshot/start through typed Preload
IPC and the Renderer shows waiting approval, completed, failed, timed out, and
cancelled evidence. It does not add submission, Notes, Mastery, Exam, a full
software-project IDE, or any capability to modify UniForge itself.

## Verification

- `npx vitest run packages/core/application/course-execution-service.test.ts packages/infrastructure/files/course-workspace-boundary.test.ts packages/platform-tool/course-execution-tool.test.ts --config vitest.config.ts` — 5 tests passed.
- `npx tsc -b tsconfig.json --pretty false` — passed.
- `npm run lint` — pending final repository gate.
- `npm run format:check` — pending final repository gate.

No new dependency, credential, network domain, migration, or UniForge source
write scope was introduced. Runner failures and process termination remain
visible in the execution result.
