import type { RuntimeState } from './adapter.js';

/** Narrow seam for the optional LangGraph package. LangGraph types never cross this boundary. */
export interface FoundationGraph {
  invoke(
    state: RuntimeState,
    options: { interruptBeforeWrite: boolean; signal?: AbortSignal },
  ): Promise<RuntimeState>;
}
export const unavailableFoundationGraph = (): FoundationGraph => ({
  async invoke() {
    throw new Error('LANGGRAPH_ADAPTER_UNAVAILABLE');
  },
});
