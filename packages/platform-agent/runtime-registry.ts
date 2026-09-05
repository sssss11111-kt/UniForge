import type { AgentRuntime } from '@uniforge/contracts';
export class RuntimeRegistry {
  private readonly runtimes = new Map<string, AgentRuntime>();
  register(name: string, runtime: AgentRuntime): void {
    const methods = ['createRun','start','stream','pause','resume','cancel','interrupt','checkpoint','fork','inspect'] as const;
    if (!name || methods.some((method) => typeof runtime[method] !== 'function')) throw new Error('INVALID_RUNTIME_ADAPTER');
    if (this.runtimes.has(name)) throw new Error('RUNTIME_ALREADY_REGISTERED');
    this.runtimes.set(name, runtime);
  }
  get(name: string): AgentRuntime | undefined { return this.runtimes.get(name); }
  unregister(name: string): void { this.runtimes.delete(name); }
}
