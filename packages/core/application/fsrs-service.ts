import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from 'ts-fsrs';

export type FsrsReviewRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
export type FsrsItemState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';
export type ReviewPriority = 'MUST_REVIEW' | 'SUGGESTED' | 'CAN_DEFER';

export interface FsrsReviewItem {
  id: string;
  dueAt: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: FsrsItemState;
  lastReviewedAt?: string;
}

export interface ScheduleReviewInput {
  item: FsrsReviewItem;
  rating: FsrsReviewRating;
  reviewedAt: string;
}

export interface ScheduledReview {
  item: FsrsReviewItem & { nextReviewAt: string };
  intervalDays: number;
  rating: FsrsReviewRating;
}

export interface ReviewPriorityContext {
  now: string;
  examDate?: string;
  examRelevance?: number;
  errorType?: string;
  dailyLoad: number;
  userAvailability?: number;
  recentPerformance?: number;
}

export interface ReviewPriorityProjection {
  item: FsrsReviewItem;
  priority: ReviewPriority;
  score: number;
  reasons: string[];
}

export interface FsrsAdapter {
  schedule(item: FsrsReviewItem, rating: FsrsReviewRating, reviewedAt: Date): ScheduledReview;
}

const RATINGS: Record<FsrsReviewRating, Rating> = {
  AGAIN: Rating.Again,
  HARD: Rating.Hard,
  GOOD: Rating.Good,
  EASY: Rating.Easy,
};

const STATES: Record<FsrsItemState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

/** Adapter boundary around ts-fsrs; domain objects never cross this boundary. */
export class TsFsrsAdapter implements FsrsAdapter {
  private readonly scheduler;

  constructor(options: { fuzz?: boolean; requestRetention?: number } = {}) {
    this.scheduler = fsrs({
      enable_fuzz: options.fuzz ?? false,
      ...(options.requestRetention === undefined
        ? {}
        : { request_retention: options.requestRetention }),
    });
  }

  schedule(item: FsrsReviewItem, rating: FsrsReviewRating, reviewedAt: Date): ScheduledReview {
    const card: Card = {
      ...createEmptyCard(reviewedAt),
      due: new Date(item.dueAt),
      stability: item.stability,
      difficulty: item.difficulty,
      reps: item.reps,
      lapses: item.lapses,
      state: STATES[item.state],
      ...(item.lastReviewedAt ? { last_review: new Date(item.lastReviewedAt) } : {}),
    };
    const result = this.scheduler.next(card, reviewedAt, RATINGS[rating] as Grade);
    const next = result.card;
    const intervalDays = Math.max(
      next.scheduled_days,
      (next.due.getTime() - reviewedAt.getTime()) / 86_400_000,
    );
    return {
      item: {
        ...item,
        dueAt: next.due.toISOString(),
        nextReviewAt: next.due.toISOString(),
        stability: next.stability,
        difficulty: next.difficulty,
        reps: next.reps,
        lapses: next.lapses,
        state: this.stateName(next.state),
        lastReviewedAt: reviewedAt.toISOString(),
      },
      intervalDays,
      rating,
    };
  }

  private stateName(state: State): FsrsItemState {
    return state === State.New
      ? 'NEW'
      : state === State.Learning
        ? 'LEARNING'
        : state === State.Review
          ? 'REVIEW'
          : 'RELEARNING';
  }
}

export class FsrsService {
  private readonly adapter: FsrsAdapter;

  constructor(options: { fuzz?: boolean; requestRetention?: number; adapter?: FsrsAdapter } = {}) {
    this.adapter = options.adapter ?? new TsFsrsAdapter(options);
  }

  scheduleReview(input: ScheduleReviewInput): ScheduledReview {
    if (!Object.hasOwn(RATINGS, input.rating)) throw new Error('invalid FSRS rating');
    const reviewedAt = new Date(input.reviewedAt);
    if (Number.isNaN(reviewedAt.getTime())) throw new Error('invalid review timestamp');
    return this.adapter.schedule(structuredClone(input.item), input.rating, reviewedAt);
  }

  projectReviewPriority(
    items: readonly FsrsReviewItem[],
    context: ReviewPriorityContext,
  ): ReviewPriorityProjection[] {
    const now = new Date(context.now);
    if (Number.isNaN(now.getTime())) throw new Error('invalid priority timestamp');
    if (!Number.isFinite(context.dailyLoad) || context.dailyLoad <= 0)
      throw new Error('daily load must be positive');
    const exam = context.examDate ? new Date(context.examDate) : undefined;
    return items
      .map((item) => this.priorityFor(item, context, now, exam))
      .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  }

  private priorityFor(
    item: FsrsReviewItem,
    context: ReviewPriorityContext,
    now: Date,
    exam?: Date,
  ): ReviewPriorityProjection {
    const due = new Date(item.dueAt);
    const overdueDays = (now.getTime() - due.getTime()) / 86_400_000;
    const daysUntilDue = -overdueDays;
    let score = overdueDays >= 0 ? 100 + overdueDays : Math.max(0, 35 - daysUntilDue * 5);
    const reasons: string[] = [];
    if (overdueDays >= 0) reasons.push('review is due');
    if (item.lapses > 0) {
      score += Math.min(item.lapses * 8, 24);
      reasons.push('recent lapses increase urgency');
    }
    if (context.recentPerformance !== undefined && context.recentPerformance < 0.6) {
      score += (0.6 - context.recentPerformance) * 40;
      reasons.push('recent performance is below target');
    }
    if (context.examRelevance !== undefined) {
      const relevance = Math.max(0, Math.min(1, context.examRelevance));
      score += relevance * 25;
      if (relevance >= 0.8) reasons.push('high exam relevance');
    }
    if (exam) {
      const examDays = (exam.getTime() - now.getTime()) / 86_400_000;
      if (examDays <= 3 && examDays >= 0) {
        score += 25;
        reasons.push('exam is within three days');
      }
    }
    if (context.errorType) reasons.push(`error dimension: ${context.errorType}`);
    if (context.userAvailability !== undefined && context.userAvailability < 0.5) score -= 5;
    const priority: ReviewPriority =
      score >= 65 ? 'MUST_REVIEW' : score >= 20 ? 'SUGGESTED' : 'CAN_DEFER';
    if (!reasons.length) reasons.push('long interval allows deferral');
    return { item: structuredClone(item), priority, score, reasons };
  }
}
