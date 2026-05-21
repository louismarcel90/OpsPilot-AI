import type { SimulationRunResult } from '../../domain/simulation/simulation-run-result.js';
import type { RunApprovalHappyPathSimulationUseCase } from './run-approval-happy-path-simulation.use-case.js';
import type { RunDeniedRuntimeActionSimulationUseCase } from './run-denied-runtime-action-simulation.use-case.js';
import type { RunApprovalRejectionPathSimulationUseCase } from './run-approval-rejection-path-simulation.use-case.js';
export class RunSimulationScenarioUseCase {
  public constructor(
    private readonly runDeniedRuntimeActionSimulationUseCase: RunDeniedRuntimeActionSimulationUseCase,
    private readonly runApprovalHappyPathSimulationUseCase: RunApprovalHappyPathSimulationUseCase,
    private readonly runApprovalRejectionPathSimulationUseCase: RunApprovalRejectionPathSimulationUseCase,
  ) {}

  public async execute(input: { readonly slug: string }): Promise<SimulationRunResult> {
    if (input.slug === 'denied_runtime_action') {
      return this.runDeniedRuntimeActionSimulationUseCase.execute();
    }

    if (input.slug === 'approval_happy_path') {
      return this.runApprovalHappyPathSimulationUseCase.execute();
    }

    if (input.slug === 'approval_rejection_path') {
      return this.runApprovalRejectionPathSimulationUseCase.execute();
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
