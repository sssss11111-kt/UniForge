/** A reference to the source supporting a durable vocabulary claim. */
export interface VocabularySourceReference {
  sourceId: string;
  locator: string;
}

export type VocabularyStateStatus = 'NEW' | 'LEARNING' | 'KNOWN' | 'MASTERED';

export interface VocabularySense {
  id: string;
  definition: string;
  translation?: string;
  partOfSpeech?: string;
  source?: VocabularySourceReference;
}

export interface Pronunciation {
  id: string;
  ipa?: string;
  dialect?: 'US' | 'UK' | 'AU' | 'OTHER';
  audioRef?: string;
  source?: VocabularySourceReference;
}

export interface Phrase {
  id: string;
  text: string;
  meaning?: string;
  source?: VocabularySourceReference;
}

export interface Example {
  id: string;
  text: string;
  translation?: string;
  source?: VocabularySourceReference;
  aiGenerated?: boolean;
}

export interface Morphology {
  id: string;
  root?: string;
  prefix?: string;
  suffix?: string;
  relatedForms: string[];
  source?: VocabularySourceReference;
}

/** Exam metadata projected onto the shared lexical entity. */
export interface ExamRelation {
  examSpaceId: string;
  label?: string;
  frequency?: number;
  source?: VocabularySourceReference;
}

/** Personal learning truth, shared by every exam relation for an entry. */
export interface VocabularyState {
  status: VocabularyStateStatus;
  familiarity: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  source?: VocabularySourceReference;
}

export interface VocabularyEntry {
  id: string;
  lemma: string;
  language: 'en';
  senses: VocabularySense[];
  pronunciations: Pronunciation[];
  phrases: Phrase[];
  examples: Example[];
  morphology: Morphology[];
  examRelations: ExamRelation[];
  state: VocabularyState;
  source?: VocabularySourceReference;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyEntryInput {
  lemma: string;
  source?: VocabularySourceReference;
}

export interface VocabularyStateInput {
  status: VocabularyStateStatus;
  familiarity: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  source?: VocabularySourceReference;
}

export interface VocabularySnapshot {
  entries: VocabularyEntry[];
  status: 'ready' | 'empty';
}
