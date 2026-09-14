import type { ContentEntity, ImportContentInput, SourceEvent } from '@uniforge/contracts';
export class ContentService {
  private readonly sources = new Map<string, SourceEvent>();
  private readonly contents = new Map<string, ContentEntity>();
  import(input: ImportContentInput): ContentEntity {
    if (!input.permissions.includes('knowledge:write'))
      throw new Error('Missing permission: knowledge:write');
    if (!input.body.trim()) throw new Error('Content body is required');
    if (this.contents.has(input.contentId)) throw new Error('Content already exists');
    this.sources.set(input.sourceEvent.id, { ...input.sourceEvent });
    const entity: ContentEntity = {
      id: input.contentId,
      sourceEventId: input.sourceEvent.id,
      body: input.body,
      mimeType: input.mimeType,
      ...(input.workspacePath ? { workspacePath: input.workspacePath } : {}),
      provenance: [input.sourceEvent.id],
      createdAt: new Date().toISOString(),
    };
    this.contents.set(entity.id, entity);
    return { ...entity, provenance: [...entity.provenance] };
  }
  get(id: string, permissions: readonly string[]): ContentEntity | null {
    if (!permissions.includes('knowledge:read'))
      throw new Error('Missing permission: knowledge:read');
    const c = this.contents.get(id);
    return c ? { ...c, provenance: [...c.provenance] } : null;
  }
}
