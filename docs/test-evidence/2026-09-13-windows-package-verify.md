# Windows package verification evidence

Date: 2026-09-13

Commit: `8b8f75e9f9847cdfd23b7b934171c314127bc07c`

GitHub Actions run: `34762437230`

Workflow: `windows-package-verify.yml`

## Result

The hosted `windows-latest` runner completed the preview package build, manifest/hash verification, installation, launch, and uninstall checks successfully in 4m26s.

The workflow also now fails fast when any source or test command fails and uploads hidden staging evidence with the corrected recursive artifact path.

## Local gates

- `npm run format:check` — passed
- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run unit` — 194/194 passed
- `npm run integration` — 47/47 passed
- `npm run check-boundaries` — passed
- `npm run check-doc-links` — passed
- `npm run check-baseline` — passed
- `npm run security` — 0 high vulnerabilities
- `npm run license` — 508 packages reviewed
- `npm run sbom` — 508 components generated

## Remaining release blockers

- The artifact is an unsigned `0.0.0` preview package.
- Clean isolated Windows VM evidence for SQLite CRUD/FTS5, sidecar lifecycle, upgrade, and rollback is still absent.
- OCR, speech, and document sidecars remain explicitly `BLOCKED` because no reviewed engine is bundled.
