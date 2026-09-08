export interface OverviewErrorSnapshot {
  readonly state: 'error';
  readonly error: { readonly message: string; readonly diagnosticRef?: string };
  readonly [key: string]: unknown;
}

export interface OverviewSnapshot {
  readonly state:
    | 'loading'
    | 'empty'
    | 'ready'
    | 'offline'
    | 'read-only'
    | 'permission-denied'
    | 'approval-required'
    | 'roadmap';
  readonly workspace?: { readonly name?: string; readonly status?: string };
  readonly items?: readonly unknown[];
  readonly approvals?: number;
  readonly error?: { readonly message: string; readonly diagnosticRef?: string };
  readonly [key: string]: unknown;
}

export type OverviewResult = OverviewSnapshot | OverviewErrorSnapshot;

export interface OverviewApi {
  readonly dashboard: { readonly getSnapshot: () => Promise<unknown> };
}

export function loadOverview(api: OverviewApi): Promise<OverviewResult>;
