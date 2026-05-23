import type { SimulationRunResult } from '../../domain/simulation/simulation-run-result.js';
import type { RunSimulationScenarioUseCase } from './run-simulation-scenario.use-case.js';
import type { SimulationProtectedActionGuard } from '../services/simulation-protected-action-guard.js';

const DEFAULT_SIMULATION_WORKSPACE_ID = 'wrk_ops_001';

export class ProtectedRunSimulationScenarioUseCase {
  public constructor(
    private readonly simulationProtectedActionGuard: SimulationProtectedActionGuard,
    private readonly runSimulationScenarioUseCase: RunSimulationScenarioUseCase,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly actorId: string;
  }): Promise<SimulationRunResult> {
    await this.simulationProtectedActionGuard.assertAllowed({
      actorId: input.actorId,
      workspaceId: DEFAULT_SIMULATION_WORKSPACE_ID,
      action: 'run_simulation',
    });

    return this.runSimulationScenarioUseCase.execute({
      slug: input.slug,
    });
  }
}
