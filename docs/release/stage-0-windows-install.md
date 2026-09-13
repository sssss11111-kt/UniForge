# Stage 0 Windows preview install runbook

This is an unsigned test package. It has no update server, updater credentials, or automatic update implementation.

## Execution checklist

1. Create a clean, snapshot-capable Windows 10/11 VM with no UniForge installation.
2. Check out the exact release commit and run `npm ci`, then `npm run package-windows`.
3. Preserve `out/make/windows-manifest.json`, the installer SHA-256, and the workflow artifact.
4. Run `npm run verify:windows-package` against that artifact.
5. Install the generated `UniForge-0.0.0 Setup.exe` silently. Record the installed versioned executable path.
6. Launch the versioned executable with a fresh user-data directory. Confirm the window loads, the typed preload health call returns `ready`, and no renderer console error is present.
7. Exercise SQLite CRUD and FTS5 through the application/domain path; record schema version and row counts before and after restarting the app.
8. For each provisioned sidecar, record `start`, `version`, `health`, `cancel`, `stop`, and crash-restart behavior. Unprovisioned OCR, speech, and document engines must remain visibly `BLOCKED`.
9. Install a controlled newer build and record upgrade behavior without deleting user data.
10. Restore the pre-upgrade VM snapshot and verify the previous build and database remain usable. Record the snapshot identifier and timestamps.
11. Uninstall and verify the application files are removed while explicitly preserved user data remains intact.

Attach command output, screenshots, manifest/hash, VM snapshot identifiers, and timestamps to the Stage 0 evidence report. Hosted GitHub runners can prove install/launch/uninstall smoke, but they do not replace steps 1, 9, or 10 because they do not provide a user-controlled snapshot boundary.

Run `npm run verify:windows-package` only against that artifact; it verifies hashes and deliberately exits `2` with `BLOCKED` until the clean VM evidence is available.
