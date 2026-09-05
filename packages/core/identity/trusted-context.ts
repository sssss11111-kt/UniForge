export interface TrustedUserContext {
  readonly actorId: string;
  readonly workspaceId: string;
  readonly source: 'main';
  readonly token: symbol;
}
export function createTrustedUserContext(actorId: string, workspaceId: string): TrustedUserContext {
  return { actorId, workspaceId, source: 'main', token: Symbol('trusted-main-context') };
}
