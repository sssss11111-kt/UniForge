import type { HealthDto } from './dto.js';
export interface UniforgeApi {
  readonly health: () => Promise<HealthDto>;
}
