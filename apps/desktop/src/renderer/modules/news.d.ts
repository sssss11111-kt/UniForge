export interface NewsWorkspaceApi {
  readonly news?: { readonly getSnapshot?: () => Promise<unknown> };
}

export interface NewsWorkspaceViewModel {
  readonly state: string;
  readonly snapshot?: unknown;
  readonly events: readonly unknown[];
  readonly sourceHealth: readonly unknown[];
  readonly savedViews: readonly unknown[];
  readonly todaySections: readonly unknown[];
  readonly pendingClaims: readonly unknown[];
  readonly pendingCorrections: readonly unknown[];
  readonly conflicts: readonly unknown[];
  readonly selectedEventId: string | null;
  readonly readOnly?: boolean;
  readonly error?: { readonly message: string };
}

export function roadmapModule(input?: { id?: string; label?: string; secondaryItems?: readonly unknown[] }): unknown;
export function loadNewsWorkspace(api: NewsWorkspaceApi): Promise<NewsWorkspaceViewModel>;
export function renderNewsWorkspace(viewModel: NewsWorkspaceViewModel): HTMLElement;
