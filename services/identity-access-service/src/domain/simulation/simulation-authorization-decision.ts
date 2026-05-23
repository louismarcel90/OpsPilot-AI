import type { RuntimeActorContext } from '../runtime/runtime-actor-context.js';
import type { SimulationProtectedAction } from './simulation-protected-action.js';

export type SimulationAuthorizationDecisionStatus = 'allow' | 'deny';

export interface SimulationAuthorizationDecision {
  readonly status: SimulationAuthorizationDecisionStatus;
  readonly actor: RuntimeActorContext;
  readonly action: SimulationProtectedAction;
  readonly reason: string;
}
