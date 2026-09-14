# Stage 2 Task 2.2 — Vocabulary Domain

Implemented the shared Vocabulary Domain with one canonical `VocabularyEntry` identity across exam spaces. The typed contract includes senses, pronunciation, phrases, examples, morphology, exam relations, provenance references, and a shared personal vocabulary state. The application service enforces vocabulary and state write permissions, validates lexical identity and familiarity bounds, and returns defensive snapshots.

Validation completed on 2026-09-06:

- `npx vitest run packages/core/application/vocabulary-service.test.ts`
- `npm run typecheck`
- `npm run lint -- --quiet`

Checkpoint: see the Task 2.2 commit recorded with this evidence.
