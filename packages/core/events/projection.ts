import type { DomainEvent } from '@uniforge/contracts/domain/events.js';
export function eventName(event: DomainEvent): string {
  return event.type;
}
