import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
export async function importManaged(
  source: string,
  managedRoot: string,
): Promise<{ fileId: string; sha256: string }> {
  const data = await fs.readFile(source);
  const sha256 = crypto.createHash('sha256').update(data).digest('hex');
  const fileId = sha256;
  await fs.mkdir(managedRoot, { recursive: true });
  const target = path.join(managedRoot, fileId);
  try {
    await fs.writeFile(target, data, { flag: 'wx' });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
  }
  return { fileId, sha256 };
}
