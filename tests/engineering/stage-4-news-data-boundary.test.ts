import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve('packages');
const forbidden =
  /(scraped[-_ ]?articles|paywalled|private[-_ ]?feed|news[-_ ]?corpus|article[-_ ]?dataset)/i;
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? files(p) : [p];
  });
}
describe('Stage 4 lawful news boundary', () => {
  it('does not bundle restricted news archives', () =>
    expect(
      files(root).filter((f) => forbidden.test(path.relative(root, f).replaceAll('\\', '/'))),
    ).toEqual([]));
  it('documents runtime provenance boundary', async () => {
    const text = await import('node:fs/promises').then((fs) =>
      fs.readFile('docs/governance/stage-4-news-data-boundary.md', 'utf8'),
    );
    expect(text).toMatch(/does not bundle/i);
    expect(text).toMatch(/provenance/i);
  });
  it('runs the production bundle boundary gate for restricted data and secrets', () => {
    const result = spawnSync(process.execPath, ['scripts/check-news-data-boundary.mjs'], {
      encoding: 'utf8',
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/boundary passed/i);
  });
});
