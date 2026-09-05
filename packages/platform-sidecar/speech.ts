import type { Json } from '@uniforge/contracts';
import type { VoiceAudio } from '@uniforge/contracts/voice/index.js';
import type { SidecarHost } from './host.js';

export class SpeechSidecarPort {
  public constructor(private readonly host: SidecarHost, private readonly id = 'speech') {}
  async health(): Promise<{ status: 'ready' | 'unavailable'; reason?: string }> {
    const result = await this.host.health(this.id);
    if (!result.ok) return { status: 'unavailable', reason: result.error.message };
    const value = result.value as { status?: string; reason?: string };
    return value.status === 'ready' ? { status: 'ready' } : { status: 'unavailable', ...(value.reason ? { reason: value.reason } : {}) };
  }
  async transcribe(audio: VoiceAudio, signal?: AbortSignal): Promise<string> {
    const result = await this.host.request(this.id, { operation: 'STT', audio: { format: audio.format, base64: audio.base64 } } as unknown as Json, signal);
    if (!result.ok) throw new Error(result.error.message);
    const value = result.value as { text?: unknown };
    if (typeof value.text !== 'string') throw new Error('Invalid speech response');
    return value.text;
  }
  async synthesize(text: string, signal?: AbortSignal): Promise<VoiceAudio> {
    const result = await this.host.request(this.id, { operation: 'TTS', text }, signal);
    if (!result.ok) throw new Error(result.error.message);
    const value = result.value as { format?: unknown; base64?: unknown };
    if (typeof value.format !== 'string' || typeof value.base64 !== 'string') throw new Error('Invalid speech response');
    return { format: value.format, base64: value.base64 };
  }
  async cancel(requestId: string): Promise<void> {
    await this.host.cancel(this.id, requestId);
  }
}
