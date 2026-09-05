import type { AgentEvent, AgentRun } from '@uniforge/contracts';
import type { Id } from '@uniforge/contracts';

export interface AgentEventStore {
  append(event: AgentEvent): void;
  events(runId: Id<'agent-run'>, afterSeq?: number): AgentEvent[];
  all(runId: Id<'agent-run'>): AgentEvent[];
  snapshot(runId: Id<'agent-run'>): AgentRun | undefined;
  saveSnapshot(run: AgentRun): void;
}

/** In-memory reference store; production persistence is wired in a later infrastructure task. */
export class InMemoryAgentEventStore implements AgentEventStore {
  private readonly history = new Map<string, AgentEvent[]>();
  private readonly runs = new Map<string, AgentRun>();
  append(event: AgentEvent): void {
    const list = this.history.get(event.runId) ?? [];
    const previous = list.at(-1);
    if (previous && event.runSeq !== previous.runSeq + 1)
      throw new Error('AGENT_EVENT_SEQUENCE_CONFLICT');
    if (!previous && event.runSeq !== 1) throw new Error('AGENT_EVENT_SEQUENCE_CONFLICT');
    if (list.some((item) => item.eventId === event.eventId))
      throw new Error('AGENT_EVENT_DUPLICATE');
    list.push(event);
    this.history.set(event.runId, list);
  }
  events(runId: Id<'agent-run'>, afterSeq = 0): AgentEvent[] {
    return (this.history.get(runId) ?? [])
      .filter((event) => event.runSeq > afterSeq)
      .map((event) => ({ ...event }));
  }
  all(runId: Id<'agent-run'>): AgentEvent[] {
    return this.events(runId, 0);
  }
  snapshot(runId: Id<'agent-run'>): AgentRun | undefined {
    const run = this.runs.get(runId);
    return run && { ...run };
  }
  saveSnapshot(run: AgentRun): void {
    this.runs.set(run.id, { ...run });
  }
}
