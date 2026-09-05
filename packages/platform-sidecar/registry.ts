export type SidecarKind = 'ocr' | 'speech' | 'document';
export interface SidecarManifest {
  id: string;
  kind: SidecarKind;
  executable: string;
  args: readonly string[];
  version: string;
  timeoutMs: number;
  maxMessageBytes: number;
  network: 'none';
  capabilities: readonly string[];
}
export class SidecarRegistry {
  private readonly entries = new Map<string, SidecarManifest>();
  register(manifest: SidecarManifest): void {
    if (
      !manifest.id ||
      !manifest.executable ||
      !isAbsoluteExecutable(manifest.executable) ||
      manifest.args.some((a) => a.includes('\n') || a.includes('\r'))
    )
      throw new Error('Invalid sidecar manifest');
    if (
      !Number.isSafeInteger(manifest.timeoutMs) ||
      manifest.timeoutMs <= 0 ||
      manifest.maxMessageBytes <= 0
    )
      throw new Error('Invalid sidecar limits');
    if (this.entries.has(manifest.id))
      throw new Error(`Sidecar already registered: ${manifest.id}`);
    this.entries.set(
      manifest.id,
      Object.freeze({
        ...manifest,
        args: Object.freeze([...manifest.args]),
        capabilities: Object.freeze([...manifest.capabilities]),
      }),
    );
  }
  get(id: string): SidecarManifest | undefined {
    return this.entries.get(id);
  }
  list(): readonly SidecarManifest[] {
    return [...this.entries.values()];
  }
}

function isAbsoluteExecutable(value: string): boolean {
  return value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value);
}
