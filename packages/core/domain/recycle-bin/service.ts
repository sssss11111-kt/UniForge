export interface RecycleEntry {
  id: string;
  workspaceId: string;
  entityType: string;
  entityId: string;
  deletedAt: string;
  purgeAfter: string;
  restoreMetadata: Record<string, unknown>;
  version: number;
}
export interface RecycleStore {
  put(entry: RecycleEntry): void;
  get(id: string): RecycleEntry | undefined;
  remove(id: string): void;
  list(workspaceId?: string): RecycleEntry[];
}

export class InMemoryRecycleStore implements RecycleStore {
  private readonly entries = new Map<string, RecycleEntry>();
  put(entry: RecycleEntry) {
    this.entries.set(entry.id, entry);
  }
  get(id: string) {
    return this.entries.get(id);
  }
  remove(id: string) {
    this.entries.delete(id);
  }
  list(workspaceId?: string) {
    return [...this.entries.values()].filter(
      (entry) => workspaceId === undefined || entry.workspaceId === workspaceId,
    );
  }
}

export class RecycleBinService {
  constructor(
    private readonly store: RecycleStore,
    private readonly now = () => new Date(),
  ) {}
  delete(entry: Omit<RecycleEntry, 'deletedAt' | 'purgeAfter'>, retentionDays = 30): RecycleEntry {
    const deletedAt = this.now().toISOString();
    const purgeAfter = new Date(this.now().getTime() + retentionDays * 86_400_000).toISOString();
    const value = { ...entry, deletedAt, purgeAfter };
    this.store.put(value);
    return value;
  }
  restore(id: string): RecycleEntry | undefined {
    const item = this.store.get(id);
    if (item) this.store.remove(id);
    return item;
  }
  purgeExpired(): number {
    const cutoff = this.now().toISOString();
    let count = 0;
    for (const item of this.store.list()) {
      if (item.purgeAfter <= cutoff) {
        this.store.remove(item.id);
        count++;
      }
    }
    return count;
  }
  list(workspaceId: string) {
    return this.store.list(workspaceId);
  }
  isSearchable(entityId: string): boolean {
    return !this.store.list().some((item) => item.entityId === entityId);
  }
}
