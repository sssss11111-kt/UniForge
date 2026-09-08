export type NewsSourceType = 'RSS' | 'WEB' | 'CONNECTOR' | 'USER';
export type NewsSourceQuality =
  'OFFICIAL' | 'AUTHORITATIVE_SECONDARY' | 'MEDIA' | 'COMMUNITY_CLUE' | 'UNVERIFIED';
export type NewsLifecycle = 'ACTIVE' | 'ARCHIVED' | 'DELETED';
export type NewsFetchStatus = 'SUCCEEDED' | 'FAILED';

export interface NewsFetchFailure {
  readonly code: string;
  readonly message: string;
  readonly failedAt?: string;
}

/** Immutable observation proposed by a connector or user. It is not a NewsEvent. */
export interface NewsSourceEvent {
  readonly id: string;
  readonly sourceType: NewsSourceType;
  readonly sourceUrl: string;
  readonly capturedAt: string;
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  readonly sourceQuality?: NewsSourceQuality;
  readonly lifecycle?: NewsLifecycle;
  readonly title: string;
  readonly body: string;
  /** Stable content identity supplied by the trusted intake boundary. */
  readonly contentHash: string;
  readonly fetchStatus?: NewsFetchStatus;
  readonly fetchFailure?: NewsFetchFailure;
}

export interface ImportNewsInput {
  readonly event: NewsSourceEvent;
  readonly permissions: readonly string[];
}

export interface RecordNewsFetchFailureInput extends ImportNewsInput {
  readonly event: NewsSourceEvent & {
    readonly fetchStatus: 'FAILED';
    readonly fetchFailure: NewsFetchFailure;
  };
}
