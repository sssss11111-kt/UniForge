import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { failure, type Result } from '@uniforge/contracts/domain/primitives.js';

const forbidden =
  /(?:api[_-]?key|secret|token|password|cookie|credential|git[_-]?cred|login[_-]?state|raw[_-]?(?:chat|voice)|personal[_-]?core)/i;
const digest = (data: Buffer) => createHash('sha256').update(data).digest('hex');
const scrub = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !forbidden.test(key))
        .map(([key, item]) => [key, scrub(item)]),
    );
  }
  return value;
};
const safeRelativePath = (value: string): boolean =>
  !isAbsolute(value) &&
  value !== '' &&
  !value.split(/[\\/]/u).includes('..') &&
  normalize(value) !== '.';

export interface ManagedBackupFile {
  relativePath: string;
  content: Buffer;
  authorized: boolean;
}
export interface BackupInput {
  schemaVersion: number;
  domainData: unknown;
  configuration?: unknown;
  indexMetadata?: unknown;
  workflows?: unknown;
  managedFiles?: ManagedBackupFile[];
}
export interface BackupManifest {
  format: 'uniforge-backup';
  formatVersion: 1;
  schemaVersion: number;
  createdAt: string;
  entries: Array<{
    relativePath: string;
    sha256: string;
    sizeBytes: number;
    contentBase64: string;
  }>;
  payload: {
    domainData: unknown;
    configuration?: unknown;
    indexMetadata?: unknown;
    workflows?: unknown;
  };
  checksum: string;
}

function canonical(manifest: Omit<BackupManifest, 'checksum'>): string {
  return JSON.stringify(manifest);
}

export async function createBackup(
  destination: string,
  input: BackupInput,
): Promise<Result<BackupManifest>> {
  try {
    if (!Number.isSafeInteger(input.schemaVersion) || input.schemaVersion < 1)
      return failure('INVALID_INPUT', 'Invalid schema version');
    const entries = (input.managedFiles ?? [])
      .filter((file) => file.authorized)
      .map((file) => ({
        relativePath: file.relativePath.replaceAll('\\', '/'),
        sha256: digest(file.content),
        sizeBytes: file.content.byteLength,
        contentBase64: file.content.toString('base64'),
      }));
    if (entries.some((entry) => !safeRelativePath(entry.relativePath)))
      return failure('INVALID_INPUT', 'Managed file path must stay inside the backup');
    const payload: BackupManifest['payload'] = { domainData: scrub(input.domainData) };
    if (input.configuration !== undefined) payload.configuration = scrub(input.configuration);
    if (input.indexMetadata !== undefined) payload.indexMetadata = scrub(input.indexMetadata);
    if (input.workflows !== undefined) payload.workflows = scrub(input.workflows);
    const base = {
      format: 'uniforge-backup' as const,
      formatVersion: 1 as const,
      schemaVersion: input.schemaVersion,
      createdAt: new Date().toISOString(),
      entries,
      payload,
    };
    const manifest = { ...base, checksum: digest(Buffer.from(canonical(base))) } as BackupManifest;
    await mkdir(dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
    await writeFile(temporary, JSON.stringify(manifest), { flag: 'wx' });
    await rename(temporary, destination);
    return { ok: true, value: manifest };
  } catch (error) {
    return failure('UNAVAILABLE', error instanceof Error ? error.message : 'Backup failed');
  }
}

export async function validateBackup(
  source: string,
  expectedSchemaVersion?: number,
): Promise<Result<BackupManifest>> {
  try {
    const raw = await readFile(source, 'utf8');
    const manifest = JSON.parse(raw) as BackupManifest;
    if (
      manifest.format !== 'uniforge-backup' ||
      manifest.formatVersion !== 1 ||
      !Number.isSafeInteger(manifest.schemaVersion)
    )
      return failure('CORRUPT_BACKUP', 'Invalid backup manifest');
    if (expectedSchemaVersion !== undefined && manifest.schemaVersion !== expectedSchemaVersion)
      return failure('CORRUPT_BACKUP', 'Schema version mismatch');
    const { checksum, ...base } = manifest;
    if (checksum !== digest(Buffer.from(canonical(base))))
      return failure('CORRUPT_BACKUP', 'Backup manifest checksum mismatch');
    for (const entry of manifest.entries) {
      if (!safeRelativePath(entry.relativePath))
        return failure('CORRUPT_BACKUP', 'Backup contains an unsafe path');
      const data = Buffer.from(entry.contentBase64, 'base64');
      if (data.byteLength !== entry.sizeBytes || digest(data) !== entry.sha256)
        return failure('CORRUPT_BACKUP', `Corrupt managed file: ${entry.relativePath}`);
    }
    return { ok: true, value: manifest };
  } catch (error) {
    return failure('CORRUPT_BACKUP', error instanceof Error ? error.message : 'Unreadable backup');
  }
}

export async function restoreBackup(
  source: string,
  destinationDir: string,
  expectedSchemaVersion?: number,
): Promise<Result<{ manifest: BackupManifest; directory: string }>> {
  const checked = await validateBackup(source, expectedSchemaVersion);
  if (!checked.ok) return checked;
  const temporary = `${destinationDir}.restore-${process.pid}-${Date.now()}`;
  try {
    await mkdir(temporary, { recursive: true });
    await writeFile(join(temporary, 'manifest.json'), JSON.stringify(checked.value));
    for (const entry of checked.value.entries) {
      const target = resolve(temporary, entry.relativePath);
      if (relative(temporary, target).startsWith('..')) throw new Error('Unsafe restore path');
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, Buffer.from(entry.contentBase64, 'base64'), { flag: 'wx' });
    }
    await rm(destinationDir, { recursive: true, force: true });
    await rename(temporary, destinationDir);
    return { ok: true, value: { manifest: checked.value, directory: destinationDir } };
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    return failure('UNAVAILABLE', error instanceof Error ? error.message : 'Restore failed');
  }
}
