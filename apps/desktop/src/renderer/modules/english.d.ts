export interface EnglishOverviewApi {
  english?: {
    getSnapshot?: () => Promise<{ spaces?: readonly unknown[] }>;
    vocabulary?: { getSnapshot?: () => Promise<{ entries?: readonly unknown[] }> };
  };
}
export function roadmapModule(options?: {
  id?: string;
  label?: string;
  secondaryItems?: readonly string[];
}): { id: string; label: string; secondaryItems: string[]; state: 'roadmap' };
export function loadEnglishOverview(api: EnglishOverviewApi): Promise<Record<string, unknown>>;
export function loadEnglishStudy(api: EnglishOverviewApi): Promise<Record<string, unknown>>;
export function renderEnglishOverview(viewModel: Record<string, unknown>): HTMLElement;
