import type { EntityId, IsoUtc } from './primitives.js';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkspaceKind = 'PERSONAL' | 'PROJECT' | 'COURSE_SANDBOX';
export interface Workspace {
  id: EntityId;
  name: string;
  kind: WorkspaceKind;
  version: number;
  createdAt: IsoUtc;
  updatedAt: IsoUtc;
}
export interface Task {
  id: EntityId;
  workspaceId: EntityId;
  title: string;
  status: TaskStatus;
  version: number;
  createdAt: IsoUtc;
  updatedAt: IsoUtc;
}
