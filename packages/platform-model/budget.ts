import type { Result } from '@uniforge/contracts';
import { failure } from '@uniforge/contracts';
export class BudgetLedger {
  private reserved = 0;
  constructor(private readonly limit: number | null = null) {}
  reserve(amount: number): Result<(actual?: number) => void> {
    if (!Number.isFinite(amount) || amount < 0)
      return failure('INVALID_INPUT', 'Invalid budget reservation');
    if (this.limit !== null && this.reserved + amount > this.limit)
      return failure('BUDGET_EXCEEDED', 'Model budget exceeded');
    this.reserved += amount;
    let settled = false;
    return {
      ok: true,
      value: (actual?: number) => {
        if (settled) return;
        settled = true;
        this.reserved -= amount;
        if (actual !== undefined) this.reserved += Math.max(0, actual);
      },
    };
  }
  get reservedAmount(): number {
    return this.reserved;
  }
}
