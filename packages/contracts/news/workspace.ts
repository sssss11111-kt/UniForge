import type { NewsClaim } from './claim.js';
import type { NewsCorrection, NewsVerification } from './verification.js';
import type { NewsEvent } from './event.js';
import type { NewsSourceEvent } from './source.js';
import type { NewsProvenanceRecord } from './provenance.js';

export type NewsWorkspaceState = 'READY' | 'EMPTY' | 'ERROR' | 'OFFLINE' | 'READ_ONLY' | 'APPROVAL';

export interface NewsSourceHealthDto {
  readonly id: string;
  readonly name: string;
  readonly status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
  readonly lastCheckedAt: string | null;
  readonly message?: string;
  readonly lastFailure?: { readonly code: string; readonly message: string };
}

export interface NewsEventDto {
  readonly event: NewsEvent;
  readonly sourceObservations: readonly NewsSourceEvent[];
  readonly claims: readonly NewsClaim[];
  readonly verification: readonly NewsVerification[];
  readonly corrections: readonly NewsCorrection[];
  readonly provenance: readonly NewsProvenanceRecord[];
}

export interface NewsSavedViewDto {
  readonly id: string;
  readonly name: string;
  readonly filters: readonly string[];
  readonly eventCount: number;
}

export interface NewsTodaySectionDto {
  readonly id: 'MODEL_PRODUCT' | 'RESEARCH' | 'OPEN_SOURCE' | 'TOOLS' | 'DOMESTIC';
  readonly title: string;
  readonly eventIds: readonly string[];
}

export interface NewsWorkspaceSnapshot {
  readonly status: NewsWorkspaceState;
  readonly readOnly: boolean;
  readonly sourceHealth: readonly NewsSourceHealthDto[];
  readonly events: readonly NewsEventDto[];
  readonly savedViews: readonly NewsSavedViewDto[];
  readonly todaySections: readonly NewsTodaySectionDto[];
  readonly selectedEventId: string | null;
  readonly pendingClaims: readonly NewsClaim[];
  readonly pendingCorrections: readonly NewsCorrection[];
  readonly conflicts: readonly NewsVerification[];
  readonly error?: string;
  readonly sourceCount: number;
  readonly eventCount: number;
  readonly claimCount: number;
  readonly conflictingCount: number;
  readonly correctionCount: number;
  readonly pendingActions: number;
}
