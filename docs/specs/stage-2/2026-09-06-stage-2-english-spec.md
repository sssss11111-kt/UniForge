# Stage 2 English Specification

Date: 2026-09-06
Status: Draft pending review

## Goal

Build an evidence-first English exam preparation workspace for CET4, CET6, IELTS, and Custom exams while keeping one shared personal vocabulary state across exam contexts.

## Scope

Stage 2 covers Exam Space, Vocabulary, learning dimensions, FSRS scheduling, adaptive training, IELTS workspace, mock exams, and lawful data boundaries. It does not implement Knowledge & Intelligence, AI News, or Project Practice.

## Domain rules

- `VocabularyEntry` is the canonical lexical entity; never create independent `CET4Word`, `CET6Word`, or `IELTSWord` entities.
- Exam-specific relations are projections and metadata over shared vocabulary.
- Every durable learning claim retains provenance and a source reference.
- AI generated exercises and evaluations are explicitly marked `AI Generated`.
- Predicted scores display `模型估计，不是官方成绩。`
- Official or unclear-license exam content is never bundled or redistributed.
- FSRS scheduling is derived state; Vocabulary and Learning Events remain domain truth.

## Initial entities

`ExamSpace`, `ExamRuleSet`, `VocabularyEntry`, `VocabularySense`, `Pronunciation`, `Phrase`, `Example`, `Morphology`, `ExamRelation`, `VocabularyState`, `LearningEvent`, `LearningDimensionEvidence`, `ReviewItem`, `TrainingItem`, `MockExam`, `MockSection`, `MockResult`, `AIEvaluation`.

## Stage boundary

All writes follow proposal/typed command → permission → approval when required → Domain Service → transaction → event → projection. Renderer uses typed Preload only. Provider SDKs, model keys, external content, and vector indexes are not domain truth.
