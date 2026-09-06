import type {
  CreateVocabularyEntryInput,
  Example,
  ExamRelation,
  Morphology,
  Phrase,
  Pronunciation,
  VocabularyEntry,
  VocabularySense,
  VocabularySnapshot,
  VocabularyStateInput,
} from '@uniforge/contracts/english/vocabulary.js';

export interface VocabularyPermission {
  canWrite: boolean;
  canWriteState: boolean;
}

export class VocabularyService {
  private readonly entries: VocabularyEntry[] = [];

  constructor(
    private readonly permission: VocabularyPermission = { canWrite: true, canWriteState: true },
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  getSnapshot(): VocabularySnapshot {
    return this.snapshot();
  }

  createEntry(input: CreateVocabularyEntryInput): VocabularyEntry {
    this.assertWrite();
    const lemma = input.lemma.trim();
    if (!lemma) throw new Error('vocabulary lemma is required');
    if (this.entries.some((entry) => entry.lemma.toLocaleLowerCase() === lemma.toLocaleLowerCase()))
      throw new Error('vocabulary entry already exists');
    const now = this.clock();
    const entry: VocabularyEntry = {
      id: `vocabulary-${this.entries.length + 1}`,
      lemma,
      language: 'en',
      senses: [],
      pronunciations: [],
      phrases: [],
      examples: [],
      morphology: [],
      examRelations: [],
      state: { status: 'NEW', familiarity: 0 },
      ...(input.source ? { source: { ...input.source } } : {}),
      createdAt: now,
      updatedAt: now,
    };
    this.entries.push(entry);
    return this.copyEntry(entry);
  }

  addSense(entryId: string, sense: Omit<VocabularySense, 'id'>): VocabularySense {
    const entry = this.find(entryId);
    this.assertWrite();
    if (!sense.definition.trim()) throw new Error('vocabulary sense definition is required');
    const value = { ...sense, id: this.nextId(entry.senses, 'sense') };
    entry.senses.push(value);
    this.touch(entry);
    return { ...value, ...(value.source ? { source: { ...value.source } } : {}) };
  }

  addPronunciation(entryId: string, pronunciation: Omit<Pronunciation, 'id'>): Pronunciation {
    const entry = this.find(entryId);
    this.assertWrite();
    const value = { ...pronunciation, id: this.nextId(entry.pronunciations, 'pronunciation') };
    entry.pronunciations.push(value);
    this.touch(entry);
    return { ...value, ...(value.source ? { source: { ...value.source } } : {}) };
  }

  addPhrase(entryId: string, phrase: Omit<Phrase, 'id'>): Phrase {
    const entry = this.find(entryId);
    this.assertWrite();
    if (!phrase.text.trim()) throw new Error('phrase text is required');
    const value = { ...phrase, id: this.nextId(entry.phrases, 'phrase') };
    entry.phrases.push(value);
    this.touch(entry);
    return { ...value, ...(value.source ? { source: { ...value.source } } : {}) };
  }

  addExample(entryId: string, example: Omit<Example, 'id'>): Example {
    const entry = this.find(entryId);
    this.assertWrite();
    if (!example.text.trim()) throw new Error('example text is required');
    const value = { ...example, id: this.nextId(entry.examples, 'example') };
    entry.examples.push(value);
    this.touch(entry);
    return { ...value, ...(value.source ? { source: { ...value.source } } : {}) };
  }

  addMorphology(entryId: string, morphology: Omit<Morphology, 'id'>): Morphology {
    const entry = this.find(entryId);
    this.assertWrite();
    const value = {
      ...morphology,
      relatedForms: [...morphology.relatedForms],
      id: this.nextId(entry.morphology, 'morphology'),
    };
    entry.morphology.push(value);
    this.touch(entry);
    return this.copyMorphology(value);
  }

  relateExam(entryId: string, relation: ExamRelation): ExamRelation {
    const entry = this.find(entryId);
    this.assertWrite();
    if (!relation.examSpaceId.trim()) throw new Error('exam space id is required');
    if (entry.examRelations.some((item) => item.examSpaceId === relation.examSpaceId))
      throw new Error('exam relation already exists');
    entry.examRelations.push(this.copyRelation(relation));
    this.touch(entry);
    return this.copyRelation(relation);
  }

  updateState(entryId: string, state: VocabularyStateInput): VocabularyEntry {
    const entry = this.find(entryId);
    if (!this.permission.canWriteState) throw new Error('permission denied: vocabulary-state:write');
    if (!Number.isFinite(state.familiarity) || state.familiarity < 0 || state.familiarity > 1)
      throw new Error('vocabulary familiarity must be between 0 and 1');
    entry.state = {
      ...state,
      ...(state.source ? { source: { ...state.source } } : {}),
    };
    this.touch(entry);
    return this.copyEntry(entry);
  }

  private find(entryId: string): VocabularyEntry {
    const entry = this.entries.find((item) => item.id === entryId);
    if (!entry) throw new Error('vocabulary entry not found');
    return entry;
  }

  private assertWrite(): void {
    if (!this.permission.canWrite) throw new Error('permission denied: vocabulary:write');
  }

  private touch(entry: VocabularyEntry): void {
    entry.updatedAt = this.clock();
  }

  private snapshot(): VocabularySnapshot {
    return {
      entries: this.entries.map((entry) => this.copyEntry(entry)),
      status: this.entries.length ? 'ready' : 'empty',
    };
  }

  private copyEntry(entry: VocabularyEntry): VocabularyEntry {
    return structuredClone(entry);
  }

  private copyMorphology(value: Morphology): Morphology {
    return { ...value, relatedForms: [...value.relatedForms], ...(value.source ? { source: { ...value.source } } : {}) };
  }

  private copyRelation(value: ExamRelation): ExamRelation {
    return { ...value, ...(value.source ? { source: { ...value.source } } : {}) };
  }

  private nextId<T extends { id: string }>(items: T[], kind: string): string {
    return `${kind}-${items.length + 1}`;
  }
}
