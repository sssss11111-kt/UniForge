export interface ProjectOverviewApi {
  project?: { getSnapshot?: () => Promise<Record<string, unknown>> };
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
