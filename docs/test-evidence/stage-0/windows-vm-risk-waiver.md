# Stage 0 risk waiver — Windows rollback verification

- Date: 2026-09-05
- Owner: Tong <17512401625@163.com>
- Scope: Stage 0 Windows preview package validation
- Status: BLOCKED / DEFERRED

## Decision

Clean Windows installation, launch, SQLite/FTS5, Sidecar, uninstall, upgrade, and rollback evidence is temporarily deferred because an isolated, snapshot-capable Windows VM is not currently available.

This is a risk waiver and evidence deferral. It does not change the Stage 0 acceptance criteria, remove the rollback requirement, or authorize entry into a later implementation stage.

## Evidence already available

- GitHub-hosted Windows Runner completed typecheck, lint, formatting, unit, integration, security, license, SBOM, desktop build, E2E smoke, and Windows packaging.
- The unsigned preview installer and `windows-manifest.json` were uploaded as a workflow artifact.
- `verify:windows-package` verified the artifact manifest and hashes before reporting the missing isolated-VM evidence.

## Residual risk

A hosted Runner is ephemeral and does not provide a user-controlled snapshot boundary. It cannot serve as durable evidence for upgrade and rollback behavior. The risk remains open until a clean Windows VM or equivalent snapshot-capable environment executes the runbook.

## Exit conditions

1. Provide an isolated Windows VM with a clean snapshot.
2. Install the preview package and record the installer hash.
3. Verify launch, SQLite/FTS5, and Sidecar health.
4. Verify uninstall.
5. Install a controlled newer build, verify upgrade, restore the snapshot, and verify rollback.
6. Attach logs and screenshots to the Stage 0 evidence directory.
7. Re-run the Windows verification gate and update the release checklist.

## Approval boundary

This waiver records temporary deferral only. It does not approve Stage 0 completion, create an acceptance tag, or permit Stage 0.5 implementation to begin.
