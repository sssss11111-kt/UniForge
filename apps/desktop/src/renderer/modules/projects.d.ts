export interface ProjectOverviewApi {
  project?: {
    getSnapshot?: () => Promise<Record<string, unknown>>;
    tasks?: { getSnapshot?: () => Promise<ProjectTaskFlowSnapshot> };
  };
}

export interface ProjectTaskFlowSnapshot {
  tasks?: readonly Record<string, unknown>[];
  decisions?: readonly unknown[];
  artifacts?: readonly unknown[];
}
export function roadmapModule(options?: {
  id?: string;
  label?: string;
  secondaryItems?: readonly string[];
}): { id: string; label: string; secondaryItems: string[]; state: 'roadmap' };
export function loadProjectOverview(api: ProjectOverviewApi): Promise<{
  state: string;
  workspace: { authorized: boolean; canonicalPath: string | null };
  capabilityBlocks: string[];
  [key: string]: unknown;
}>;
export function loadProjectTaskFlow(api: ProjectOverviewApi): Promise<
  | {
      state: 'roadmap';
      reason: string;
    }
  | {
      state: 'empty' | 'ready';
      tasks: readonly Record<string, unknown>[];
      decisions: readonly unknown[];
      artifacts: readonly unknown[];
    }
  | {
      state: 'error';
      error: { message: string };
    }
>;
export function renderProjectOverview(viewModel: Record<string, unknown>): HTMLElement;
export function renderSoftwareWorkspace(options?: {
  authorized?: boolean;
  canonicalPath?: string | null;
  files?: readonly string[];
  git?: Record<string, unknown>;
  test?: Record<string, unknown>;
}): HTMLElement;

export function renderProjectTaskFlow(options?: {
  tasks?: readonly Record<string, unknown>[];
  decisions?: readonly unknown[];
  artifacts?: readonly unknown[];
}): HTMLElement;
