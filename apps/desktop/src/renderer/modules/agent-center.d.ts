export interface AgentCenterErrorSnapshot {
  readonly state: 'error';
  readonly error: { readonly message: string; readonly diagnosticRef?: string };
  readonly [key: string]: unknown;
}

export interface AgentCenterSnapshot {
  readonly state:
    | 'loading'
    | 'empty'
    | 'ready'
    | 'offline'
    | 'read-only'
    | 'permission-denied'
    | 'approval-required'
    | 'roadmap';
  readonly runs?: readonly unknown[];
  readonly approvals?: readonly unknown[];
  readonly error?: { readonly message: string; readonly diagnosticRef?: string };
  readonly [key: string]: unknown;
}

export type AgentCenterResult = AgentCenterSnapshot | AgentCenterErrorSnapshot;

export interface AgentCenterApi {
  readonly agentCenter: { readonly getSnapshot: () => Promise<unknown> };
}

export function loadAgentCenter(api: AgentCenterApi): Promise<AgentCenterResult>;
