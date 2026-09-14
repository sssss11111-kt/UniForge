import type { ContentEntity, ImportSourceInput, SourceEvent } from '@uniforge/contracts';

export interface ImportedSource {
  readonly sourceEvent: SourceEvent;
  readonly content: ContentEntity;
}

export interface SourceImportFilePort {
  copyAndRead(input: { sourcePath: string; managedWorkspaceRoot: string }): Promise<{
    body: string;
    fileId: string;
    sha256: string;
    managedCopyPath: string;
  }>;
}

/** Application boundary for copying source bytes and recording canonical metadata. */
export class SourceImportService {
  private readonly sources = new Map<string, SourceEvent>();
  private readonly contents = new Map<string, ContentEntity>();

  constructor(private readonly files: SourceImportFilePort) {}

  async import(input: ImportSourceInput): Promise<ImportedSource> {
    this.require(input.permissions, 'knowledge:write');
    if (!input.sourceEvent.license?.trim()) throw new Error('Source license is required');
    if (!input.sourceEvent.capturedAt.trim()) throw new Error('Source capture time is required');
    if (this.sources.has(input.sourceEvent.id)) throw new Error('Source event already exists');

    assertManagedWorkspace(input.managedWorkspaceRoot);
    const copied = await this.files.copyAndRead({
      sourcePath: input.sourcePath,
      managedWorkspaceRoot: input.managedWorkspaceRoot,
    });
    const { body, managedCopyPath } = copied;
    const license = input.sourceEvent.license;
    const lifecycle = input.sourceEvent.lifecycle ?? 'ACTIVE';
    const sourceEvent: SourceEvent = {
      ...input.sourceEvent,
      checksum: copied.sha256,
      lifecycle,
      managedCopyPath,
    };
    const contentId = `content-${copied.fileId}`;
    if (this.contents.has(contentId)) throw new Error('Content already exists');
    const provenanceRecord = {
      sourceEventId: sourceEvent.id,
      capturedAt: sourceEvent.capturedAt,
      locator: sourceEvent.locator,
      ...(sourceEvent.checksum === undefined ? {} : { checksum: sourceEvent.checksum }),
      ...(sourceEvent.license === undefined ? {} : { license: sourceEvent.license }),
    };
    const content: ContentEntity = {
      id: contentId,
      sourceEventId: sourceEvent.id,
      body,
      mimeType: input.mimeType ?? 'application/octet-stream',
      workspacePath: managedCopyPath,
      provenance: [sourceEvent.id],
      provenanceRecords: [provenanceRecord],
      checksum: copied.sha256,
      license,
      lifecycle,
      createdAt: new Date().toISOString(),
    };
    this.sources.set(sourceEvent.id, sourceEvent);
    this.contents.set(content.id, content);
    return this.clone({ sourceEvent, content });
  }

  getSource(id: string, permissions: readonly string[]): SourceEvent | null {
    this.require(permissions, 'knowledge:read');
    const source = this.sources.get(id);
    return source ? { ...source } : null;
  }

  getContent(id: string, permissions: readonly string[]): ContentEntity | null {
    this.require(permissions, 'knowledge:read');
    const content = this.contents.get(id);
    return content ? this.cloneContent(content) : null;
  }

  private require(permissions: readonly string[], permission: string): void {
    if (!permissions.includes(permission)) throw new Error(`Missing permission: ${permission}`);
  }

  private clone(value: ImportedSource): ImportedSource {
    return { sourceEvent: { ...value.sourceEvent }, content: this.cloneContent(value.content) };
  }

  private cloneContent(value: ContentEntity): ContentEntity {
    return {
      ...value,
      provenance: [...value.provenance],
      ...(value.provenanceRecords
        ? { provenanceRecords: value.provenanceRecords.map((record) => ({ ...record })) }
        : {}),
    };
  }
}

function assertManagedWorkspace(managedRoot: string): void {
  if (
    managedRoot
      .split(/[\\/]/)
      .some((segment) =>
        ['.git', 'node_modules', 'updater', 'migration', 'permission'].includes(
          segment.toLowerCase(),
        ),
      )
  ) {
    throw new Error('PROTECTED_PATH');
  }
}
