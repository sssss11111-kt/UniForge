import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('packages');
const forbidden =
  /(?:cambridge|ielts|cet4|cet6|wordlist|corpus|answer[-_ ]?key|vocabulary[-_ ]?dataset)/i;
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : [p];
  });
}

describe('Stage 2 lawful data boundary', () => {
  it('does not bundle restricted or unclear-license datasets in packages', () => {
    const matches = files(root).filter((file) => {
      const relative = path.relative(root, file).replaceAll('\\', '/');
      if (relative.includes('/dist/') || relative.includes('/ielts')) return false;
      return forbidden.test(relative);
    });
    expect(matches).toEqual([]);
  });
  it('keeps canonical English data policy documented', async () => {
    const text = await import('node:fs/promises').then((fs) =>
      fs.readFile('docs/governance/stage-2-data-boundary.md', 'utf8'),
    );
    expect(text).toMatch(/must not bundle/i);
    expect(text).toMatch(/provenance/i);
  });
});
