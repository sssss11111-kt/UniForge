import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import type { Result } from '@uniforge/contracts/domain/primitives.js';
import { failure } from '@uniforge/contracts/domain/primitives.js';

export interface MarkdownSource { sourceId: string; path: string; content: string; hash: string; locator: string; }
export interface MarkdownDiff { path: string; beforeHash: string; afterHash: string; content: string; }
const hash = (content: string) => createHash('sha256').update(content, 'utf8').digest('hex');
export async function readMarkdownSource(path: string, sourceId = path): Promise<Result<MarkdownSource>> {
  try { const content = await readFile(path, 'utf8'); return { ok: true, value: { sourceId, path, content, hash: hash(content), locator: path } }; }
  catch { return failure('NOT_FOUND', 'Markdown source is unavailable'); }
}
export function createMarkdownDiff(source: MarkdownSource, content: string): MarkdownDiff {
  return { path: source.path, beforeHash: source.hash, afterHash: hash(content), content };
}
export async function writeMarkdownDiff(diff: MarkdownDiff, expectedCurrentHash: string): Promise<Result<MarkdownSource>> {
  const current = await readMarkdownSource(diff.path);
  if (!current.ok) return current;
  if (current.value.hash !== expectedCurrentHash || current.value.hash !== diff.beforeHash) return failure('CONFLICT', 'Vault changed; stale Markdown diff rejected');
  try { await writeFile(diff.path, diff.content, 'utf8'); return readMarkdownSource(diff.path); }
  catch { return failure('UNAVAILABLE', 'Markdown source cannot be written'); }
}
