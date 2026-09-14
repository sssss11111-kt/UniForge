import path from 'node:path';
import { isProtectedPath } from './protected-path-policy.js';

export type WorkspaceBoundaryResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly error: 'PROTECTED_PATH' };

export class CourseWorkspaceBoundary {
  private readonly protectedRoots: readonly string[];

  constructor(options: { readonly protectedRoots?: readonly string[] } = {}) {
    this.protectedRoots = (options.protectedRoots ?? [process.cwd()]).map((root) =>
      resolvePlatformPath(root),
    );
  }

  assertEntry(workspaceRoot: string, entrypoint: string): WorkspaceBoundaryResult {
    const root = resolvePlatformPath(workspaceRoot);
    const target = resolvePlatformPath(root, entrypoint);
    const inside = target === root || target.startsWith(`${root}${path.sep}`);
    const protectedRoot = this.protectedRoots.some(
      (candidate) =>
        root === candidate ||
        root.startsWith(`${candidate}${path.sep}`) ||
        candidate.startsWith(`${root}${path.sep}`),
    );
    if (!inside || protectedRoot || isProtectedPath(root) || isProtectedPath(target))
      return { ok: false, error: 'PROTECTED_PATH' };
    return { ok: true, path: target };
  }
}

function resolvePlatformPath(first: string, ...rest: string[]): string {
  const windows = /^[A-Za-z]:[\\/]/.test(first);
  return (windows ? path.win32 : path).resolve(first, ...rest);
}
