import type { Json, Id } from '../domain/primitives.js';

export interface AgentDefinition {
  id: Id<'agent-definition'>;
  version: number;
  role: string;
  domain: string;
  modelPolicy: Json;
  contextPolicy: Json;
  toolPolicy: Json;
  permissionPolicy: Json;
  budgetPolicy: Json;
  outputSchema: Json;
}
