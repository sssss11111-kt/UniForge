import { describe, expect, it } from 'vitest';
import { FsrsService, type FsrsReviewItem, type FsrsReviewRating } from './fsrs-service.js';

const now = '2026-09-06T08:00:00.000Z';

function item(overrides: Partial<FsrsReviewItem> = {}): FsrsReviewItem {
  return {
    id: 'vocabulary-1',
    dueAt: now,
    stability: 0,
    difficulty: 0,
    reps: 0,
    lapses: 0,
    state: 'NEW',
    ...overrides,
  };
}

describe('FsrsService', () => {
  it('schedules the same review deterministically through the adapter boundary', () => {
    const service = new FsrsService({ fuzz: false });
    const input = { item: item(), rating: 'GOOD' as FsrsReviewRating, reviewedAt: now };

    const first = service.scheduleReview(input);
    const second = service.scheduleReview(input);

    expect(first).toEqual(second);
    expect(first.item.id).toBe('vocabulary-1');
    expect(first.item.state).toBe('LEARNING');
    expect(first.item.nextReviewAt).toBeDefined();
    expect(first.intervalDays).toBeGreaterThan(0);
  });

  it('projects due and prioritized cards into Must Review, Suggested, and Can Defer', () => {
    const service = new FsrsService({ fuzz: false });
    const examDate = '2026-09-16T08:00:00.000Z';
    const projection = service.projectReviewPriority(
      [
        item({ id: 'due', dueAt: '2026-09-05T08:00:00.000Z' }),
        item({ id: 'suggested', dueAt: '2026-09-08T08:00:00.000Z', stability: 2 }),
        item({ id: 'defer', dueAt: '2026-10-01T08:00:00.000Z', stability: 10 }),
      ],
      { now, examDate, dailyLoad: 3, recentPerformance: 0.7 },
    );

    expect(projection.map((entry) => [entry.item.id, entry.priority])).toEqual([
      ['due', 'MUST_REVIEW'],
      ['suggested', 'SUGGESTED'],
      ['defer', 'CAN_DEFER'],
    ]);
  });

  it('raises priority for exam relevance and recent errors without mutating source items', () => {
    const service = new FsrsService({ fuzz: false });
    const source = item({ dueAt: '2026-09-09T08:00:00.000Z', stability: 3, lapses: 1 });
    const result = service.projectReviewPriority([source], {
      now,
      examDate: '2026-09-10T08:00:00.000Z',
      examRelevance: 1,
      errorType: 'MEANING',
      recentPerformance: 0.2,
      dailyLoad: 10,
    });

    expect(result[0]?.priority).toBe('MUST_REVIEW');
    expect(source).toEqual(item({ dueAt: '2026-09-09T08:00:00.000Z', stability: 3, lapses: 1 }));
    expect(result[0]?.reasons.length).toBeGreaterThan(0);
  });

  it('rejects invalid review inputs at the application boundary', () => {
    const service = new FsrsService();
    expect(() =>
      service.scheduleReview({ item: item(), rating: 'BAD' as FsrsReviewRating, reviewedAt: now }),
    ).toThrow('invalid FSRS rating');
    expect(() => service.projectReviewPriority([], { now, dailyLoad: 0 })).toThrow(
      'daily load must be positive',
    );
  });
});
