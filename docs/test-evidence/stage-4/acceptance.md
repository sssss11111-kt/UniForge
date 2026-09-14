# Stage 4 AI News — Acceptance Record

This document records the Stage 4 acceptance candidate and its evidence. It is not user acceptance.

## Scope

Stage 4 covers provenance-first news intake, normalized events, citation-bearing claims, cross-source verification, correction history, News workspace IPC/Preload/Renderer behavior, evidence-linked actions, and the lawful data boundary.

## Results

The fresh validation run on 2026-09-09 passed focused News tests, typecheck, lint, formatting, unit and integration suites, security, license, boundary, lawful-news, documentation-link, baseline, desktop build, E2E smoke, and `git diff --check`. Exact counts and commands are recorded in [acceptance-candidate.md](acceptance-candidate.md).

The E2E suite initially found stale expectations that 06 AI 新闻 was disabled. Since the route now has a real News snapshot and typed IPC/Preload adapter, those expectations were corrected and the suite was rerun successfully with 4/4 tests passing.

## Decision

The repository is ready for explicit user review of the Stage 4 candidate. User acceptance has not yet been recorded, so no Stage 4 acceptance tag may be created.
