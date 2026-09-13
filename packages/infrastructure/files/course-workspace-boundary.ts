import path from 'node:path';
import { isProtectedPath } from './protected-path-policy.js';

export type WorkspaceBoundaryResult =
  | { readonly ok: true; readonly path: string }
  | { readonly ok: false; readonly error: 'PROTECTED_PATH' };

export class CourseWorkspaceBoundary {
  private readonly protectedRoots: readonly string[];

  constructor(options: { readonly protectedRoots?: readonly string[] } = {}) {
    this.protectedRoots = (options.protectedRoots ?? [process.cwd()]).map((root) =>
      path.resolve(root),
    );
  }

  assertEntry(workspaceRoot: string, entrypoint: string): WorkspaceBoundaryResult {
    const root = path.resolve(workspaceRoot);
    const target = path.resolve(root, entrypoint);
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
