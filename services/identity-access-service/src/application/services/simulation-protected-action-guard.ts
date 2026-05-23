import type { RuntimeActorContextResolver } from './runtime-actor-context-resolver.js';
import type { SimulationAuthorizationDecision } from '../../domain/simulation/simulation-authorization-decision.js';
import type { SimulationProtectedAction } from '../../domain/simulation/simulation-protected-action.js';

export class SimulationProtectedActionGuard {
  public constructor(private readonly runtimeActorContextResolver: RuntimeActorContextResolver) {}

  public async evaluate(input: {
    readonly actorId: string;
    readonly workspaceId: string;
    readonly action: SimulationProtectedAction;
  }): Promise<SimulationAuthorizationDecision | null> {
    const actor = await this.runtimeActorContextResolver.resolve({
      actorId: input.actorId,
      workspaceId: input.workspaceId,
    });

    if (actor === null) {
      return null;
    }

    const isAllowed = actor.role === 'admin' || actor.role === 'system';

    return {
      status: isAllowed ? 'allow' : 'deny',
      actor,
      action: input.action,
      reason: isAllowed
        ? 'Actor is allowed to access protected simulation controls.'
        : 'Only admin or system actors can access protected simulation controls.',
    };
  }

  public async assertAllowed(input: {
    readonly actorId: string;
    readonly workspaceId: string;
    readonly action: SimulationProtectedAction;
  }): Promise<SimulationAuthorizationDecision> {
    const decision = await this.evaluate(input);

    if (decision === null) {
      throw new Error('Simulation actor context could not be resolved.');
    }

    if (decision.status === 'deny') {
      throw new Error(`Simulation action denied: ${decision.reason}`);
    }

    return decision;
  }
}
