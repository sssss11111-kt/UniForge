import type { Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';
import { createMarkdownDiff, readMarkdownSource, writeMarkdownDiff, type MarkdownDiff, type MarkdownSource } from '../markdown/source.js';
export class ObsidianAdapter {
  constructor(private readonly readOnly = true) {}
  read(path: string, sourceId = path): Promise<Result<MarkdownSource>> { return readMarkdownSource(path, sourceId); }
  diff(source: MarkdownSource, content: string): MarkdownDiff { return createMarkdownDiff(source, content); }
  async confirmWrite(diff: MarkdownDiff): Promise<Result<MarkdownSource>> {
    if (this.readOnly) return failure('DENIED', 'Obsidian adapter is read-only');
    return writeMarkdownDiff(diff, diff.beforeHash);
  }
}
