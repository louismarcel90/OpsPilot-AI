import type { SimulationAuthorizationDecision } from '../../domain/simulation/simulation-authorization-decision.js';
import type { SimulationProtectedAction } from '../../domain/simulation/simulation-protected-action.js';
import type { SimulationProtectedActionGuard } from '../services/simulation-protected-action-guard.js';

const DEFAULT_SIMULATION_WORKSPACE_ID = 'wrk_ops_001';

export class GetSimulationAuthorizationDiagnosticsUseCase {
  public constructor(
    private readonly simulationProtectedActionGuard: SimulationProtectedActionGuard,
  ) {}

  public async execute(input: {
    readonly actorId: string;
    readonly action: SimulationProtectedAction;
  }): Promise<SimulationAuthorizationDecision | null> {
    return this.simulationProtectedActionGuard.evaluate({
      actorId: input.actorId,
      workspaceId: DEFAULT_SIMULATION_WORKSPACE_ID,
      action: input.action,
    });
  }
}
