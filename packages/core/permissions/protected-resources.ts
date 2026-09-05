export const PROTECTED_RESOURCE_PREFIXES = [
  'uniforge-source:',
  'uniforge-install:',
  'uniforge-updater:',
  'uniforge-migrations:',
  'uniforge-permissions:',
  'uniforge-build:',
] as const;
export function isProtectedResource(handle: string): boolean {
  return PROTECTED_RESOURCE_PREFIXES.some((prefix) => handle.startsWith(prefix));
}
