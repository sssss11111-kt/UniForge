/** Runtime-only checkpoint contracts. These records are never domain entities or events. */
export type { RuntimeCheckpoint, RuntimeCheckpointStore } from './adapter.js';
export { InMemoryRuntimeCheckpointStore } from './adapter.js';
