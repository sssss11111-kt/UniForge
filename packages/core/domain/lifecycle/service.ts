export interface ShutdownParticipant {
  readonly name: string;
  readonly stop: () => Promise<void>;
}

export interface ExitRequest {
  readonly hasUnsavedChanges: boolean;
  readonly closeToTray?: boolean;
  readonly confirmUnsaved?: boolean;
}

export type ExitDecision =
  | { readonly action: 'CLOSE_TO_TRAY' }
  | { readonly action: 'CONFIRM_UNSAVED' }
  | { readonly action: 'EXIT' };

export interface ShutdownResult {
  readonly failures: ReadonlyArray<{ participant: string; message: string }>;
}

export class ExitCoordinator {
  private lastDecision: ExitDecision | undefined;
  constructor(private readonly participants: readonly ShutdownParticipant[]) {}

  decide(request: ExitRequest): ExitDecision {
    this.lastDecision = request.closeToTray
      ? { action: 'CLOSE_TO_TRAY' }
      : request.hasUnsavedChanges && !request.confirmUnsaved
        ? { action: 'CONFIRM_UNSAVED' }
        : { action: 'EXIT' };
    return this.lastDecision;
  }

  async shutdown(): Promise<ShutdownResult> {
    const failures: Array<{ participant: string; message: string }> = [];
    if (this.lastDecision?.action !== 'EXIT') return { failures };
    for (const participant of this.participants) {
      try {
        await participant.stop();
      } catch (error) {
        failures.push({
          participant: participant.name,
          message: error instanceof Error ? error.message : 'Shutdown failed',
        });
      }
    }
    return { failures };
  }
}
