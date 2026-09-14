# Formal release inputs

Status: PREVIEW ONLY (2026-09-14)

The repository currently produces an unsigned `0.0.0` preview installer. A formal Windows release may be enabled only after all inputs below are supplied and verified in CI.

## Required inputs

- SemVer release version greater than `0.0.0`.
- Windows Authenticode signing tool (`signtool.exe` or an approved equivalent).
- Code-signing certificate held in CI secret storage; the private key must never enter the repository, SQLite, logs, artifacts, or ordinary configuration.
- Timestamp service URL and documented availability policy.
- Reviewed, redistributable OCR, speech, and document engines with pinned versions, licenses, Windows support, and security review recorded in `docs/governance/third-party-registry.md`.
- Clean snapshot-capable Windows VM evidence for install, upgrade, rollback, SQLite/FTS5, Sidecar lifecycle, and uninstall.

## Release gate

Until every input is present, `signed` must remain `false`, the product version must remain a preview version, and unavailable Sidecars must remain visibly `BLOCKED`. No release workflow may silently substitute a self-signed certificate, unsigned artifact, mock engine, or hosted runner for the missing evidence.
