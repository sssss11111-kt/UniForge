# Docker isolation test evidence

Date: 2026-09-14

Environment: Docker Desktop Linux engine, `node:24-bookworm`, mounted repository at `/workspace`.

Command:

```text
docker run --rm -v "${PWD}:/workspace" -w /workspace node:24-bookworm bash -lc "npm ci --ignore-scripts && npm run unit && npm run integration"
```

## Result

- Unit: 71 test files, 194 tests passed.
- Integration: 21 test files, 47 tests passed.
- Cross-platform Windows workspace boundary test: 1 test passed in the same container image after commit `1287736`.

The container run validates the SQLite, Sidecar protocol/recovery, permission, and filesystem-boundary test suites in an isolated Linux runtime. It does not provide Windows kernel behavior, a Windows installer snapshot, or a user-controlled upgrade/rollback boundary.

The container's `npm ci` reported development-tool advisory/deprecation warnings; the repository runtime audit remains `npm run security` with zero high vulnerabilities.
