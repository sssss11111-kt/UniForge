import type { AgentEvent, AgentRun, AgentRunStatus } from '@uniforge/contracts';

const transitions: Record<AgentRunStatus, readonly AgentRunStatus[]> = {
  CREATED: ['RUNNING', 'CANCELLED'],
  RUNNING: ['WAITING_APPROVAL', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'],
  WAITING_APPROVAL: ['PAUSED', 'CANCELLED'],
  PAUSED: ['RUNNING', 'WAITING_APPROVAL', 'CANCELLED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};
export function canTransition(from: AgentRunStatus, to: AgentRunStatus): boolean {
  return transitions[from].includes(to);
}
export function reduceAgentEvents(
  events: readonly AgentEvent[],
  seed?: AgentRun,
): AgentRun | undefined {
  let run = seed ? { ...seed } : undefined;
  for (const event of events) {
    if (event.type === 'RunCreated') {
      const p = event.payload as {
        taskId: AgentRun['taskId'];
        definitionId: AgentRun['definitionId'];
        definitionVersion: number;
        runtime: string;
      };
      run = {
        id: event.runId,
        workspaceId: event.workspaceId,
        taskId: p.taskId,
        definitionId: p.definitionId,
        definitionVersion: p.definitionVersion,
        runtime: p.runtime,
        status: 'CREATED',
        version: 1,
        lastSeq: event.runSeq,
        createdAt: event.occurredAt,
        updatedAt: event.occurredAt,
      };
      continue;
    }
    if (!run) throw new Error('AGENT_RUN_NOT_CREATED');
    const status =
      event.type === 'RunStarted'
        ? 'RUNNING'
        : event.type === 'RunPaused'
          ? (event.payload as { approval?: boolean }).approval
            ? 'WAITING_APPROVAL'
            : 'PAUSED'
          : event.type === 'ApprovalResolved'
            ? 'PAUSED'
            : event.type === 'RunResumed'
              ? 'RUNNING'
              : event.type === 'RunCompleted'
                ? 'COMPLETED'
                : event.type === 'RunFailed'
                  ? 'FAILED'
                  : event.type === 'RunCancelled'
                    ? 'CANCELLED'
                    : run.status;
    if (status !== run.status) {
      if (!canTransition(run.status, status)) throw new Error('AGENT_INVALID_TRANSITION');
      run.status = status;
    }
    run.lastSeq = event.runSeq;
    run.version += 1;
    run.updatedAt = event.occurredAt;
  }
  return run;
}
