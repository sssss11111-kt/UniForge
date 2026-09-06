import { describe, expect, it } from 'vitest';
import { VocabularyService } from './vocabulary-service.js';

describe('VocabularyService', () => {
  it('keeps one shared entry with rich lexical relations and exam projections', () => {
    const service = new VocabularyService(undefined, () => '2026-09-06T00:00:00.000Z');
    const entry = service.createEntry({
      lemma: '  resilient ',
      source: { sourceId: 'source-1', locator: 'page-2' },
    });
    service.addSense(entry.id, { definition: 'able to recover quickly', partOfSpeech: 'adjective' });
    service.addPronunciation(entry.id, { ipa: '/rɪˈzɪliənt/', dialect: 'US' });
    service.addPhrase(entry.id, { text: 'resilient system' });
    service.addExample(entry.id, { text: 'She is resilient.' });
    service.addMorphology(entry.id, { root: 'resile', relatedForms: ['resilience'] });
    service.relateExam(entry.id, { examSpaceId: 'exam-CET4', label: 'CET4' });
    service.relateExam(entry.id, { examSpaceId: 'exam-IELTS', label: 'IELTS' });

    const snapshot = service.getSnapshot();
    expect(snapshot.status).toBe('ready');
    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0]?.lemma).toBe('resilient');
    expect(snapshot.entries[0]?.examRelations).toHaveLength(2);
    expect(snapshot.entries[0]?.senses[0]?.definition).toBe('able to recover quickly');
  });

  it('shares vocabulary state across exam relations and preserves source provenance', () => {
    const service = new VocabularyService(undefined, () => '2026-09-06T00:00:00.000Z');
    const entry = service.createEntry({ lemma: 'focus' });
    service.relateExam(entry.id, { examSpaceId: 'exam-CET6' });
    service.relateExam(entry.id, { examSpaceId: 'exam-CET4' });
    const updated = service.updateState(entry.id, {
      status: 'LEARNING',
      familiarity: 0.4,
      source: { sourceId: 'learning-event-1', locator: 'review-1' },
    });

    expect(updated.state.status).toBe('LEARNING');
    expect(updated.state.source?.sourceId).toBe('learning-event-1');
    expect(service.getSnapshot().entries[0]?.state.familiarity).toBe(0.4);
  });

  it('rejects invalid input, duplicate lexical identity, and unauthorized writes', () => {
    const service = new VocabularyService();
    expect(() => service.createEntry({ lemma: '   ' })).toThrow('lemma is required');
    service.createEntry({ lemma: 'Word' });
    expect(() => service.createEntry({ lemma: ' word ' })).toThrow('already exists');
    expect(() => new VocabularyService({ canWrite: false, canWriteState: true }).createEntry({ lemma: 'x' })).toThrow(
      'permission denied',
    );
    const stateService = new VocabularyService({ canWrite: true, canWriteState: false });
    const entry = stateService.createEntry({ lemma: 'state' });
    expect(() => stateService.updateState(entry.id, { status: 'KNOWN', familiarity: 1 })).toThrow(
      'vocabulary-state:write',
    );
    expect(() => service.updateState('missing', { status: 'KNOWN', familiarity: 1 })).toThrow('not found');
  });

  it('returns defensive snapshots', () => {
    const service = new VocabularyService();
    service.createEntry({ lemma: 'copy' });
    const snapshot = service.getSnapshot();
    snapshot.entries[0]!.lemma = 'mutated';
    expect(service.getSnapshot().entries[0]?.lemma).toBe('copy');
  });
});
