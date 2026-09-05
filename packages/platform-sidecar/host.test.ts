import { describe, expect, it } from 'vitest';
import { SidecarHost } from './host.js';
import { SidecarRegistry } from './registry.js';

const script = `process.stdin.setEncoding('utf8'); process.stdin.on('data', d => d.trim().split('\\n').filter(Boolean).forEach(x => { const r=JSON.parse(x); const result=r.method==='health'?{status:'ready'}:r.method==='version'?{version:'test-1'}:{accepted:true}; process.stdout.write(JSON.stringify({protocolVersion:1,requestId:r.requestId,ok:true,result})+'\\n'); }));`;
const registry = () => {
  const r = new SidecarRegistry();
  r.register({
    id: 'fixture',
    kind: 'document',
    executable: process.execPath,
    args: ['-e', script],
    version: 'test-1',
    timeoutMs: 500,
    maxMessageBytes: 16_384,
    network: 'none',
    capabilities: ['health'],
  });
  return r;
};

describe('SidecarHost', () => {
  it('starts, calls health/version/request and shuts down', async () => {
    const host = new SidecarHost(registry());
    expect((await host.start('fixture')).ok).toBe(true);
    const health = await host.health('fixture');
    const version = await host.version('fixture');
    const request = await host.request('fixture', { job: 'probe' });
    expect(health.ok && health.value).toEqual({ status: 'ready' });
    expect(version.ok && version.value).toEqual({ version: 'test-1' });
    expect(request.ok && request.value).toEqual({ accepted: true });
    await host.shutdown();
    expect((await host.health('fixture')).ok).toBe(false);
  });
  it('returns cancellation when an in-flight request is aborted', async () => {
    const r = new SidecarRegistry();
    r.register({
      id: 'slow',
      kind: 'ocr',
      executable: process.execPath,
      args: ['-e', "process.stdin.on('data',()=>{})"],
      version: 'test',
      timeoutMs: 1000,
      maxMessageBytes: 4096,
      network: 'none',
      capabilities: [],
    });
    const host = new SidecarHost(r);
    await host.start('slow');
    const controller = new AbortController();
    const pending = host.request('slow', { input: 'x' }, controller.signal);
    controller.abort();
    const result = await pending;
    expect(result.ok ? 'ok' : result.error.code).toBe('CANCELLED');
    await host.shutdown();
  });
});
