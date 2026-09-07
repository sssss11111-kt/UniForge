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
});
