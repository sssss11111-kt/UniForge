export async function fileTransaction<T>(work: () => Promise<T>): Promise<T> {
  return work();
}
