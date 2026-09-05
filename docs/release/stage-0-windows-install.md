# Stage 0 Windows preview install runbook

This is an unsigned test package. It has no update server, updater credentials, or automatic update implementation.

Run `npm ci`, then `npm run package-windows` on Windows. Preserve `out/make/windows-manifest.json` and the installer hash. In an isolated clean Windows VM, verify installation, launch, SQLite CRUD/FTS5, sidecar health, uninstall, and controlled upgrade/rollback. Run `npm run verify:windows-package` only against that artifact; it verifies hashes and deliberately exits `2` with `BLOCKED` until the clean VM evidence is available.
