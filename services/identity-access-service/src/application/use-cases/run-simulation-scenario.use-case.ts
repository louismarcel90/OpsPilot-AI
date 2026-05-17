import type { SimulationRunResult } from '../../domain/simulation/simulation-run-result.js';
import type { RunDeniedRuntimeActionSimulationUseCase } from './run-denied-runtime-action-simulation.use-case.js';

export class RunSimulationScenarioUseCase {
  public constructor(
    private readonly runDeniedRuntimeActionSimulationUseCase: RunDeniedRuntimeActionSimulationUseCase,
  ) {}

  public async execute(input: { readonly slug: string }): Promise<SimulationRunResult> {
    if (input.slug === 'denied_runtime_action') {
      return this.runDeniedRuntimeActionSimulationUseCase.execute();
    }

    return {
      scenarioSlug: input.slug,
      status: 'failed',
      checks: [
        {
          name: 'scenario_runner_available',
          passed: false,
          message: `No executable runner is available for scenario "${input.slug}".`,
        },
      ],
      summary: 'Simulation runner is not available for this scenario yet.',
    };
  }
}
