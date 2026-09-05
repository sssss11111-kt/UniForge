import { describe, expect, it } from 'vitest';
import { SidecarRegistry } from '@uniforge/platform-sidecar';

describe('sidecar manifest scope', () => {
  it('rejects relative executables and newline argv', () => {
    const registry = new SidecarRegistry();
    expect(() =>
      registry.register({
        id: 'relative',
        kind: 'ocr',
        executable: 'python',
        args: [],
        version: '1',
        timeoutMs: 100,
        maxMessageBytes: 100,
        network: 'none',
        capabilities: [],
      }),
    ).toThrow();
    expect(() =>
      registry.register({
        id: 'newline',
        kind: 'ocr',
        executable: process.execPath,
        args: ['bad\narg'],
        version: '1',
        timeoutMs: 100,
        maxMessageBytes: 100,
        network: 'none',
        capabilities: [],
      }),
    ).toThrow();
  });
});
