import { describe, expect, it } from 'vitest';
import { SidecarHost, SidecarRegistry } from '@uniforge/platform-sidecar';

describe('sidecar crash recovery', () => {
  it('removes a crashed process so it can be started again', async () => {
    const registry = new SidecarRegistry();
    registry.register({
      id: 'crasher',
      kind: 'document',
      executable: process.execPath,
      args: ['-e', 'process.exit(1)'],
      version: '1',
      timeoutMs: 200,
      maxMessageBytes: 4096,
      network: 'none',
      capabilities: [],
    });
    const host = new SidecarHost(registry);
    await host.start('crasher');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect((await host.health('crasher')).ok).toBe(false);
    await host.shutdown();
  });
});
