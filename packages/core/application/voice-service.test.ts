import { describe, expect, it } from 'vitest';
import { VoiceService } from './voice-service.js';
import type { VoiceRequest } from '@uniforge/contracts/voice/index.js';

const context = { actor: 'user' as const, permissions: ['voice:use'] };
const input = (overrides: Partial<VoiceRequest> = {}): VoiceRequest => ({
  requestId: 'voice-1',
  operation: 'STT',
  audio: { format: 'wav', base64: 'AQI=' },
  mode: 'GLOBAL',
  incognito: false,
  continuous: false,
  wakeWordEnabled: false,
  context,
  ...overrides,
});

describe('VoiceService', () => {
  it('keeps speech unavailable visible when the sidecar health check fails', async () => {
    const service = new VoiceService({
      health: async () => ({ status: 'unavailable', reason: 'runtime not provisioned' }),
      transcribe: async () => { throw new Error('must not run'); },
      synthesize: async () => { throw new Error('must not run'); },
      cancel: async () => undefined,
    });

    const result = await service.execute(input());

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sessions[0]?.status).toBe('UNAVAILABLE');
  });

  it('requires approval for cloud speech and exposes waiting approval', async () => {
    const service = new VoiceService(
      {
        health: async () => ({ status: 'ready' }),
        transcribe: async () => 'hello',
        synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
        cancel: async () => undefined,
      },
      { request: async () => ({ status: 'PENDING', approvalId: 'approval-voice' }) },
    );

    const result = await service.execute(input({ provider: 'cloud' }));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sessions[0]?.status).toBe('WAITING_APPROVAL');
  });

  it('returns completed transcription and does not create memory or domain records', async () => {
    const service = new VoiceService({
      health: async () => ({ status: 'ready' }),
      transcribe: async () => 'hello',
      synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
      cancel: async () => undefined,
    });

    const result = await service.execute(input());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sessions[0]).toMatchObject({ status: 'COMPLETED', text: 'hello' });
      expect(result.value.sessions[0]).not.toHaveProperty('memoryId');
    }
  });

  it('does not retain transcript or audio for incognito voice', async () => {
    const service = new VoiceService({
      health: async () => ({ status: 'ready' }),
      transcribe: async () => 'private',
      synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
      cancel: async () => undefined,
    });
    const result = await service.execute(input({ incognito: true }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sessions[0]).not.toHaveProperty('text');
  });

  it('reports cancellation and sidecar failure without claiming success', async () => {
    const service = new VoiceService({
      health: async () => ({ status: 'ready' }),
      transcribe: async () => { throw new Error('engine crashed'); },
      synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
      cancel: async () => undefined,
    });
    const failed = await service.execute(input());
    expect(failed.ok).toBe(true);
    if (failed.ok) expect(failed.value.sessions[0]?.status).toBe('FAILED');

    const cancellable = new VoiceService({
      health: async () => ({ status: 'ready' }),
      transcribe: async (_audio, signal) => await new Promise<string>((resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      }),
      synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
      cancel: async () => undefined,
    });
    const pending = cancellable.execute(input({ requestId: 'voice-2' }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const cancelled = await cancellable.cancel('voice-2');
    await pending;
    expect(cancelled.ok).toBe(true);
    if (cancelled.ok) expect(cancelled.value.sessions[0]?.status).toBe('CANCELLED');
  });

  it('rejects voice use without the required permission', async () => {
    const service = new VoiceService({
      health: async () => ({ status: 'ready' }),
      transcribe: async () => 'hello',
      synthesize: async () => ({ format: 'wav', base64: 'AwQ=' }),
      cancel: async () => undefined,
    });
    await expect(service.execute(input({ context: { actor: 'user', permissions: [] } }))).rejects.toThrow('PERMISSION_DENIED');
  });
});
