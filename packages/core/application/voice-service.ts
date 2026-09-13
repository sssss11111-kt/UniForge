import type {
  VoiceAudio,
  VoiceRequest,
  VoiceSession,
  VoiceSnapshotDto,
} from '@uniforge/contracts/voice/index.js';

export interface SpeechPort {
  health(): Promise<{ status: 'ready' | 'unavailable'; reason?: string }>;
  transcribe(audio: VoiceAudio, signal?: AbortSignal): Promise<string>;
  synthesize(text: string, signal?: AbortSignal): Promise<VoiceAudio>;
  cancel(requestId: string): Promise<void>;
}

export interface VoiceApprovalPort {
  request(input: { requestId: string; operation: VoiceRequest['operation'] }): Promise<{
    status: 'APPROVED' | 'PENDING' | 'DENIED';
    approvalId?: string;
  }>;
}

export class VoiceService {
  private readonly sessions: VoiceSession[] = [];
  private readonly controllers = new Map<string, AbortController>();
  private sidecar: VoiceSnapshotDto['sidecar'] = { status: 'unavailable', reason: 'not checked' };

  public constructor(
    private readonly speech: SpeechPort,
    private readonly approval: VoiceApprovalPort = {
      request: async () => ({ status: 'APPROVED' }),
    },
  ) {}

  async getSnapshot(): Promise<VoiceSnapshotDto> {
    return {
      state: this.sessions.at(-1)?.status ?? 'IDLE',
      sessions: [...this.sessions],
      sidecar: this.sidecar,
    };
  }

  async execute(input: VoiceRequest): Promise<{ ok: true; value: VoiceSnapshotDto }> {
    if (input.context.actor !== 'user' || !input.context.permissions.includes('voice:use'))
      throw new Error('PERMISSION_DENIED');
    if (!input.requestId || (input.operation === 'STT' ? !input.audio : !input.text?.trim()))
      throw new Error('INVALID_INPUT');
    this.upsert(base(input));
    const health = await this.speech.health();
    this.sidecar = health;
    if (health.status !== 'ready')
      return this.store({
        ...base(input),
        status: 'UNAVAILABLE',
        ...(health.reason ? { error: health.reason } : {}),
      });
    const approval =
      input.provider === 'cloud'
        ? await this.approval.request({ requestId: input.requestId, operation: input.operation })
        : { status: 'APPROVED' as const };
    if (approval.status === 'DENIED')
      return this.store({
        ...base(input),
        status: 'FAILED',
        error: 'APPROVAL_DENIED',
        ...(approval.approvalId ? { approvalId: approval.approvalId } : {}),
      });
    if (approval.status === 'PENDING' && !input.approvalId)
      return this.store({
        ...base(input),
        status: 'WAITING_APPROVAL',
        ...(approval.approvalId ? { approvalId: approval.approvalId } : {}),
      });
    const controller = new AbortController();
    this.controllers.set(input.requestId, controller);
    try {
      const value =
        input.operation === 'STT'
          ? { text: await this.speech.transcribe(input.audio!, controller.signal) }
          : { audio: await this.speech.synthesize(input.text!, controller.signal) };
      return this.store({ ...base(input), status: 'COMPLETED', ...(input.incognito ? {} : value) });
    } catch (error) {
      return this.store({
        ...base(input),
        status: controller.signal.aborted ? 'CANCELLED' : 'FAILED',
        error: error instanceof Error ? error.message : 'VOICE_FAILED',
      });
    } finally {
      this.controllers.delete(input.requestId);
    }
  }

  async cancel(requestId: string): Promise<{ ok: true; value: VoiceSnapshotDto }> {
    this.controllers.get(requestId)?.abort();
    await this.speech.cancel(requestId);
    const session = this.sessions.find((item) => item.requestId === requestId);
    if (!session || session.status === 'COMPLETED' || session.status === 'FAILED')
      return { ok: true, value: this.snapshot() };
    return this.store({ ...session, status: 'CANCELLED', error: 'CANCELLED' });
  }

  private store(session: VoiceSession): { ok: true; value: VoiceSnapshotDto } {
    this.upsert(session);
    return { ok: true, value: this.snapshot() };
  }
  private upsert(session: VoiceSession): void {
    const index = this.sessions.findIndex((item) => item.requestId === session.requestId);
    if (index < 0) this.sessions.push(session);
    else this.sessions[index] = session;
  }
  private snapshot(): VoiceSnapshotDto {
    return {
      state: this.sessions.at(-1)?.status ?? 'IDLE',
      sessions: [...this.sessions],
      sidecar: this.sidecar,
    };
  }
}

function base(input: VoiceRequest): VoiceSession {
  return {
    requestId: input.requestId,
    operation: input.operation,
    mode: input.mode,
    status: 'STARTING',
    incognito: input.incognito,
  };
}
