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

export function roadmapModule(input?: RoadmapModuleInput, api?: unknown): RoadmapModule;
