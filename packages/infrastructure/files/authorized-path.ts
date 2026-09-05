import path from 'node:path';
export const canonicalize = (p: string): string => path.resolve(p);
export const isWithin = (root: string, candidate: string): boolean => {
  const r = canonicalize(root);
  const c = canonicalize(candidate);
  return c === r || c.startsWith(r + path.sep);
};
