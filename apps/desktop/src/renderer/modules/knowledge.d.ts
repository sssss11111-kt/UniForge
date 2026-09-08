export interface RoadmapModuleInput {
  readonly id?: string;
  readonly label?: string;
  readonly secondaryItems?: readonly unknown[];
}

export interface RoadmapModule {
  readonly id: string;
  readonly label: string;
  readonly secondaryItems: readonly unknown[];
  readonly state: 'roadmap';
}

export interface KnowledgeWorkspaceSourceHealth {
  readonly id: string;
  readonly name: string;
  readonly status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNKNOWN';
  readonly lastCheckedAt: string | null;
}

export interface KnowledgeWorkspaceViewModel {
  readonly state: string;
  readonly readOnly?: boolean;
  readonly snapshot?: unknown;
  readonly inbox: readonly unknown[];
  readonly topics: readonly unknown[];
  readonly memories: readonly unknown[];
  readonly actions: readonly unknown[];
  readonly sourceHealth: readonly KnowledgeWorkspaceSourceHealth[];
  readonly selectedContentId: string | null;
  readonly pendingApprovals: number;
  readonly error?: { readonly message: string };
}

export interface KnowledgeWorkspaceApi {
  readonly knowledge?: {
    readonly getSnapshot?: () => Promise<unknown>;
  };
}

export function roadmapModule(input?: RoadmapModuleInput, api?: unknown): RoadmapModule;
export function loadKnowledgeWorkspace(
  api: KnowledgeWorkspaceApi,
): Promise<KnowledgeWorkspaceViewModel>;
export function renderKnowledgeWorkspace(viewModel: KnowledgeWorkspaceViewModel): HTMLElement;
