# Stage 2 Task 2.3 — Learning Dimensions

Implemented independent, provenance-backed evidence for meaning, spelling, listening, pronunciation, part of speech, morphology, collocation, context, and secondary senses. Each evidence record carries its own outcome and optional partial score; snapshots aggregate attempts, correct answers, errors, and score per dimension so an error updates only the related ability.

The application service requires `learning-dimension:write`, validates canonical UTC provenance timestamps and score bounds, rejects duplicate evidence IDs, and returns defensive snapshots. `recordError` is provided for the common partial error update flow.

Validation completed on 2026-09-06:

- `npx vitest run packages/core/application/learning-dimension-service.test.ts`
- `npm run typecheck`
- `npm run lint -- --quiet`
- `git diff --check`
