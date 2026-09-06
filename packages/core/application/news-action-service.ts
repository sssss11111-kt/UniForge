import type { CreateNewsActionInput, NewsAction } from '@uniforge/contracts';
export class NewsActionService {
  private readonly actions = new Map<string, NewsAction>();
  create(input: CreateNewsActionInput): NewsAction {
    if (!input.permissions.includes('news:propose'))
      throw new Error('Missing permission: news:propose');
    if (!input.action.evidenceIds.length) throw new Error('Evidence required');
    const a = {
      ...input.action,
      evidenceIds: [...input.action.evidenceIds],
      status: 'WAITING_APPROVAL' as const,
    };
    this.actions.set(a.id, a);
    return { ...a, evidenceIds: [...a.evidenceIds] };
  }
  send(id: string, permissions: readonly string[]): NewsAction {
    if (!permissions.includes('external:send'))
      throw new Error('Missing permission: external:send');
    const a = this.actions.get(id);
    if (!a) throw new Error('Action not found');
    if (a.status !== 'WAITING_APPROVAL') throw new Error('Action approval required');
    const sent = { ...a, status: 'SENT' as const };
    this.actions.set(id, sent);
    return { ...sent, evidenceIds: [...sent.evidenceIds] };
  }
  fail(id: string, error: string, permissions: readonly string[]): NewsAction {
    if (!permissions.includes('external:send'))
      throw new Error('Missing permission: external:send');
    const a = this.actions.get(id);
    if (!a) throw new Error('Action not found');
    const f = { ...a, status: 'FAILED' as const, error };
    this.actions.set(id, f);
    return { ...f, evidenceIds: [...f.evidenceIds] };
  }
}
