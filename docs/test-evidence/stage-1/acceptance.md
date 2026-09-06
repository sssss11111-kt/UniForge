# Stage 1 Acceptance — Course

Date: 2026-09-06
Status: Pending user acceptance

## Scope

Stage 1 delivers the approved desktop/course vertical slices from Task 1.1 through Task 1.15. It does not implement Stage 2 English business logic or later-stage modules.

## Task checkpoints

| Task | Checkpoint |
|---|---|
| 1.1 App Shell | `1a52ec5` |
| 1.2 Settings / Model / Permission / Workspace | `0c2e7cf` |
| 1.3 Dashboard | `a731416` |
| 1.4 Course Domain | `563abb2` |
| 1.5 Course Material Import | `9040d6e` |
| 1.6 Syllabus / Timetable / Deadline Recognition | `b8105a5` |
| 1.7 Course AI | `b40f81a` |
| 1.8 Assignment Modes | `dfdb5a2` |
| 1.9 Course Code Execution | `8999539` |
| 1.10 Course Notes | `c306fa2` |
| 1.11 Mastery / Wrong Problems | `092d9c3` |
| 1.12 Exam / Review Plan | `fbe46d6` |
| 1.13 Agent Center Basic | `dba99c7` |
| 1.14 Voice MVP | `b8c7bd5` |
| 1.15 Backup / Recycle / Exit | `91dcce8` |

## Verification evidence

- TypeScript build: passed
- ESLint: passed
- Unit tests: 42 files / 106 tests passed
- Integration tests: 8 files / 12 tests passed
- Desktop build: passed
- Boundary scan: passed
- Canonical document link check: passed
- `git diff --check`: passed
- Working tree: clean

## Architectural acceptance checks

- Domain Core remains the business source of truth.
- Renderer uses typed Preload APIs and does not access Node, SQLite, filesystem, credentials, or shell directly.
- Agent, Model Gateway, Tool Gateway, and sidecars do not become domain truth.
- Course code execution is restricted to explicitly authorized project workspaces.
- AI proposals and drafts retain evidence/provenance and require approval where applicable.
- Voice incognito data is not admitted into memory or domain truth.
- Backup, recycle, and exit flows preserve visible failure states.
- No `07` Development Zone was added.

## Known limitations

- Clean Windows VM install/upgrade/rollback evidence remains deferred under the existing Stage 0 risk waiver.
- Default desktop coordinator registration for long-running Agent/Connector/News participants remains injectable rather than enabled by default, as recorded in Task 1.15 evidence.
- Stage 1 acceptance does not waive the deferred Stage 0 Windows VM evidence.

## Acceptance decision

User acceptance: Pending.

After explicit user acceptance, create the tag `stage-1-course-accepted` on commit `91dcce8` and prepare Stage 2 planning documents.
