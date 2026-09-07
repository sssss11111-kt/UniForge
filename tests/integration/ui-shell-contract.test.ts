import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('UI shell migration contract', () => {
  it('keeps the seven primary module ids and excludes the removed development area', () => {
    const ids = ['overview', 'agent-center', 'course', 'english', 'projects', 'knowledge', 'news'];

    expect(ids).toHaveLength(7);
    expect(ids).not.toContain('development');
  });

  it('keeps roadmap modules disabled until a typed snapshot exists', () => {
    const available = new Set(['overview', 'agent-center', 'course']);

    expect(available.has('english')).toBe(false);
    expect(available.has('projects')).toBe(false);
    expect(available.has('knowledge')).toBe(false);
    expect(available.has('news')).toBe(false);
  });

  it('defines the approved warm editorial tokens in the source stylesheet', async () => {
    const css = (await readFile('apps/desktop/src/renderer/ui/tokens.css', 'utf8')).toLowerCase();

    expect(css).toContain('--uf-canvas: #f4efe7');
    expect(css).toContain('--uf-surface: #fffdf9');
    expect(css).toContain('--uf-accent: #d98a52');
    expect(css).toContain('--uf-primary-width: 76px');
    expect(css).toContain('--uf-inspector-width: 288px');
  });
});
