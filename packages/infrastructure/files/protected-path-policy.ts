import path from 'node:path';
const protectedTokens = ['.git', 'node_modules', 'updater', 'migration', 'permission'];
export const isProtectedPath = (p: string): boolean =>
  protectedTokens.some((t) => p.toLowerCase().split(/[\\/]/).includes(t));
export const assertAuthorizedWritable = (root: string, candidate: string): void => {
  if (!isWithin(root, candidate) || isProtectedPath(candidate)) throw new Error('PROTECTED_PATH');
};
const isWithin = (root: string, candidate: string) => {
  const r = path.resolve(root);
  const c = path.resolve(candidate);
  return c === r || c.startsWith(r + path.sep);
};
