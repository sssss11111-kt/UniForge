# 2026-09-06 Stage 2 English Development Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the Stage 2 English exam preparation vertical slices in the approved order.

**Architecture:** Domain Core owns exam, vocabulary, learning-event, review, training, and mock-exam truth. Model Gateway may propose AI-generated content and evaluations, while FSRS and projections remain derived services. Typed IPC and Preload expose only validated commands and snapshots.

**Tech Stack:** Existing TypeScript monorepo, Electron, typed IPC/Preload, Vitest, integration tests, desktop build, and `ts-fsrs` only after third-party registry approval.

**Spec:** `docs/specs/stage-2/2026-09-06-stage-2-english-spec.md`

## Global Constraints

- One shared `VocabularyEntry` identity across exams.
- No independent CET4Word/CET6Word/IELTSWord entities.
- AI content is labeled `AI Generated` and requires approval before durable publication.
- Official or unclear-license exam content is not bundled.
- Renderer cannot access Node, SQLite, filesystem, credentials, shell, or arbitrary IPC.
- Every task produces focused tests, evidence, checkpoint commit, and rollback notes.

### Task 2.1: Exam Space Domain

**Files:**
- Create: `packages/contracts/english/exam-space.ts`
- Create: `packages/core/application/exam-space-service.ts`
- Test: `packages/core/application/exam-space-service.test.ts`
- Modify: `packages/contracts/index.ts`, `packages/core/index.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.1.md`

**Deliverable:** CET4, CET6, IELTS, and Custom exam spaces with isolated rule sets and typed create/update commands.

### Task 2.2: Vocabulary Domain

**Files:**
- Create: `packages/contracts/english/vocabulary.ts`
- Create: `packages/core/application/vocabulary-service.ts`
- Test: `packages/core/application/vocabulary-service.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.2.md`

**Deliverable:** Shared vocabulary entities, senses, pronunciation, phrases, examples, morphology, exam relations, and vocabulary state.

### Task 2.3: Learning Dimensions

**Files:**
- Create: `packages/contracts/english/learning-dimensions.ts`
- Create: `packages/core/application/learning-dimension-service.ts`
- Test: `packages/core/application/learning-dimension-service.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.3.md`

**Deliverable:** Independent evidence for meaning, spelling, listening, pronunciation, part of speech, morphology, collocation, context, and secondary senses.

### Task 2.4: FSRS Engine

**Files:**
- Create: `packages/core/application/fsrs-service.ts`
- Create: `packages/core/application/fsrs-service.test.ts`
- Modify: `docs/governance/third-party-registry.md`
- Evidence: `docs/test-evidence/stage-2/task-2.4.md`

**Deliverable:** Approved `ts-fsrs` adapter, deterministic review scheduling, and Must Review/Suggested/Can Defer projections.

### Task 2.5: Adaptive Training

**Files:**
- Create: `packages/contracts/english/training.ts`
- Create: `packages/core/application/adaptive-training-service.ts`
- Test: `packages/core/application/adaptive-training-service.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.5.md`

**Deliverable:** Dimension-driven training proposals with visible AI Generated labeling and approval states.

### Task 2.6: IELTS Workspace

**Files:**
- Create: `packages/contracts/english/ielts.ts`
- Create: `packages/core/application/ielts-workspace-service.ts`
- Test: `packages/core/application/ielts-workspace-service.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.6.md`

**Deliverable:** IELTS Overview, Plan, Vocabulary, Listening, Reading, Writing, Speaking, Mock Exam, Materials, and AI Coach navigation contracts without restricted bundled content.

### Task 2.7: Mock Exam and Results

**Files:**
- Create: `packages/contracts/english/mock-exam.ts`
- Create: `packages/core/application/mock-exam-service.ts`
- Test: `packages/core/application/mock-exam-service.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.7.md`

**Deliverable:** Exam instances, sections, raw results, error dimensions, AI evaluations, model version, confidence, and score disclaimer.

### Task 2.8: Lawful English Data Boundary

**Files:**
- Modify: `docs/governance/third-party-registry.md`
- Create: `docs/governance/stage-2-data-boundary.md`
- Test: `tests/engineering/stage-2-data-boundary.test.ts`
- Evidence: `docs/test-evidence/stage-2/task-2.8.md`

**Deliverable:** Registry and automated checks preventing unverified vocabulary, Cambridge/IELTS content, or unclear-license datasets from being bundled.

## Stage 2 Acceptance

Acceptance requires all Task 2.1–2.8 evidence, full repository gates, lawful-data review, permission review, and a user decision before creating `stage-2-english-accepted`.
