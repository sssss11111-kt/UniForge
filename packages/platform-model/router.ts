import type {
  ModelCapability,
  ModelRequest,
  ModelRoute,
  ModelRouteLevel,
  Result,
} from '@uniforge/contracts';
import { failure } from '@uniforge/contracts';

const levels: ModelRouteLevel[] = ['run', 'preset', 'owner', 'module', 'global', 'fallback'];
export class ModelRouter {
  constructor(private readonly routes: ReadonlyMap<string, ModelRoute>) {}
  resolve(request: ModelRequest): Result<ModelRoute> {
    for (const level of levels) {
      const id = request.routeOverrides[level];
      if (id) {
        const route = this.routes.get(id);
        if (route) return { ok: true, value: route };
        if (level !== 'fallback') return failure('UNAVAILABLE', `Route ${id} is unavailable`);
      }
    }
    return failure('UNAVAILABLE', 'No model route is configured');
  }
  get(routeId: string): ModelRoute | undefined {
    return this.routes.get(routeId);
  }
  supports(route: ModelRoute, required: readonly ModelCapability[]): boolean {
    return required.every((cap) => route.capabilities.includes(cap));
  }
}
