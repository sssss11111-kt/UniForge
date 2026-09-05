import { access } from 'node:fs/promises';
const links = [
  'docs/specs/2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md',
  'docs/superpowers/plans/2026-09-05-stage-0-architecture-foundation.md',
];
for (const link of links) await access(link);
console.log(`Checked ${links.length} canonical document links.`);
