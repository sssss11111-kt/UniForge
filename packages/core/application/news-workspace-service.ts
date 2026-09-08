import type {
  NewsClaim,
  NewsCorrection,
  NewsEventDto,
  NewsSavedViewDto,
  NewsSourceHealthDto,
  NewsTodaySectionDto,
  NewsVerification,
  NewsWorkspaceSnapshot,
} from '@uniforge/contracts';

export interface NewsWorkspaceSeed {
  readonly events?: readonly NewsEventDto[];
  readonly sourceHealth?: readonly NewsSourceHealthDto[];
  readonly savedViews?: readonly NewsSavedViewDto[];
  readonly todaySections?: readonly NewsTodaySectionDto[];
  readonly selectedEventId?: string | null;
  readonly status?: NewsWorkspaceSnapshot['status'];
  readonly readOnly?: boolean;
  readonly error?: string;
}

/** Read-only projection for the News workspace. Domain services remain the source of truth. */
export class NewsWorkspaceService {
  constructor(private readonly seed: NewsWorkspaceSeed = {}) {}

  getSnapshot(permissions: readonly string[]): NewsWorkspaceSnapshot {
    if (!permissions.includes('news:read')) throw new Error('Missing permission: news:read');
    const events = (this.seed.events ?? []).map(cloneEventDto);
    const pendingClaims = events.flatMap((item) =>
      item.claims.filter((claim) => claim.status === 'PENDING'),
    );
    const pendingCorrections = events.flatMap((item) =>
      item.corrections.filter((correction) => correction.outcome === 'PENDING_APPROVAL'),
    );
    const conflicts = events.flatMap((item) =>
      item.verification.filter((verification) => verification.status === 'CONFLICTING'),
    );
    const sourceCount = new Set(
      events.flatMap((item) => item.sourceObservations.map((source) => source.id)),
    ).size;
    const claimCount = events.reduce((count, item) => count + item.claims.length, 0);
    const correctionCount = events.reduce((count, item) => count + item.corrections.length, 0);
    return {
      status: this.seed.status ?? (events.length ? 'READY' : 'EMPTY'),
      readOnly: this.seed.readOnly ?? true,
      sourceHealth: (this.seed.sourceHealth ?? []).map((source) => ({
        ...source,
        ...(source.lastFailure ? { lastFailure: { ...source.lastFailure } } : {}),
      })),
      events,
      savedViews: (this.seed.savedViews ?? []).map((view) => ({
        ...view,
        filters: [...view.filters],
      })),
      todaySections: (this.seed.todaySections ?? []).map((section) => ({
        ...section,
        eventIds: [...section.eventIds],
      })),
      selectedEventId: this.seed.selectedEventId ?? events[0]?.event.id ?? null,
      pendingClaims: pendingClaims.map(cloneClaim),
      pendingCorrections: pendingCorrections.map(cloneCorrection),
      conflicts: conflicts.map(cloneVerification),
      ...(this.seed.error === undefined ? {} : { error: this.seed.error }),
      sourceCount,
      eventCount: events.length,
      claimCount,
      conflictingCount: conflicts.length,
      correctionCount,
      pendingActions: pendingCorrections.length,
    };
  }
}

function cloneEventDto(item: NewsEventDto): NewsEventDto {
  return {
    event: {
      ...item.event,
      sourceEventIds: [...item.event.sourceEventIds],
      provenance: [...item.event.provenance],
      provenanceRecords: item.event.provenanceRecords.map((record) => ({ ...record })),
    },
    sourceObservations: item.sourceObservations.map((source) => ({
      ...source,
      ...(source.fetchFailure ? { fetchFailure: { ...source.fetchFailure } } : {}),
    })),
    claims: item.claims.map(cloneClaim),
    verification: item.verification.map(cloneVerification),
    corrections: item.corrections.map(cloneCorrection),
    provenance: item.provenance.map((record) => ({ ...record })),
  };
}

function cloneClaim(claim: NewsClaim): NewsClaim {
  return {
    ...claim,
    evidence: claim.evidence.map((evidence) => ({ ...evidence })),
    provenance: { ...claim.provenance, sourceEventIds: [...claim.provenance.sourceEventIds] },
  };
}

function cloneVerification(verification: NewsVerification): NewsVerification {
  return {
    ...verification,
    supportingSourceIds: [...verification.supportingSourceIds],
    conflictingSourceIds: [...verification.conflictingSourceIds],
  };
}

function cloneCorrection(correction: NewsCorrection): NewsCorrection {
  return {
    ...correction,
    sourceIds: [...correction.sourceIds],
    ...(correction.evidence
      ? { evidence: correction.evidence.map((evidence) => ({ ...evidence })) }
      : {}),
    ...(correction.previousVersion
      ? {
          previousVersion: {
            ...correction.previousVersion,
            sourceIds: [...correction.previousVersion.sourceIds],
            evidence: correction.previousVersion.evidence.map((evidence) => ({ ...evidence })),
          },
        }
      : {}),
    ...(correction.failure ? { failure: { ...correction.failure } } : {}),
  };
}
