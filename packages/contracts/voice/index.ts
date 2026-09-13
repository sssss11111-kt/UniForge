export type VoiceOperation = 'STT' | 'TTS';
export type VoiceMode = 'GLOBAL' | 'AGENT_INPUT';
export type VoiceProvider = 'local' | 'cloud';
export type VoiceStatus =
  | 'IDLE'
  | 'STARTING'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'UNAVAILABLE';

export interface VoiceContext {
  readonly actor: 'user' | 'agent';
  readonly permissions: readonly string[];
}

export interface VoiceAudio {
  readonly format: string;
  readonly base64: string;
}

export interface VoiceRequest {
  readonly requestId: string;
  readonly operation: VoiceOperation;
  readonly mode: VoiceMode;
  readonly provider?: VoiceProvider;
  readonly audio?: VoiceAudio;
  readonly text?: string;
  readonly incognito: boolean;
  readonly continuous: boolean;
  readonly wakeWordEnabled: boolean;
  readonly context: VoiceContext;
  readonly approvalId?: string;
}

export interface VoiceSession {
  readonly requestId: string;
  readonly operation: VoiceOperation;
  readonly mode: VoiceMode;
  readonly status: VoiceStatus;
  readonly incognito: boolean;
  readonly text?: string;
  readonly audio?: VoiceAudio;
  readonly approvalId?: string;
  readonly error?: string;
}

export interface VoiceSnapshotDto {
  readonly state: VoiceStatus;
  readonly sessions: readonly VoiceSession[];
  readonly sidecar: { readonly status: 'ready' | 'unavailable'; readonly reason?: string };
}
