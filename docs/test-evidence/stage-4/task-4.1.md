# Stage 4 Task 4.1 — Source Intake and NewsEvent Domain

Implemented provenance-bearing source intake and normalized NewsEvent records. Duplicate content hashes merge source references into one canonical event; source events and canonical news records remain separate domain objects. Canonical records retain capture, publication, update, source-quality, lifecycle, dedupe identity, and provenance-record fields. Failed connector fetches remain visible as source evidence without creating a NewsEvent. Invalid URLs, timestamps, lifecycle values, duplicate sources, and missing permissions fail closed.

Validation: `npx vitest run packages/core/application/news-source-service.test.ts` (5/5), `npm run typecheck`, focused ESLint, and `npm run check-boundaries`.
