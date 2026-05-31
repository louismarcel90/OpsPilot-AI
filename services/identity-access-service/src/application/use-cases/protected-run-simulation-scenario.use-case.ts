import { randomUUID } from 'node:crypto';

import type { SimulationRunResult } from '../../domain/simulation/simulation-run-result.js';
import type { SimulationRunHistoryStore } from '../services/simulation-run-history-store.js';
import type { SimulationProtectedActionGuard } from '../services/simulation-protected-action-guard.js';
import type { RunSimulationScenarioUseCase } from './run-simulation-scenario.use-case.js';

const DEFAULT_SIMULATION_WORKSPACE_ID = 'wrk_ops_001';

export class ProtectedRunSimulationScenarioUseCase {
  public constructor(
    private readonly simulationProtectedActionGuard: SimulationProtectedActionGuard,
    private readonly runSimulationScenarioUseCase: RunSimulationScenarioUseCase,
    private readonly simulationRunHistoryStore: SimulationRunHistoryStore,
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

    const startedAtIso = new Date().toISOString();

    const result = await this.runSimulationScenarioUseCase.execute({
      slug: input.slug,
    });

    const completedAtIso = new Date().toISOString();

    this.simulationRunHistoryStore.append({
      id: randomUUID(),
      scenarioSlug: input.slug,
      actorId: input.actorId,
      status: result.status,
      ...(result.workflowRunId !== undefined ? { workflowRunId: result.workflowRunId } : {}),
      result,
      startedAtIso,
      completedAtIso,
    });

    return result;
  }
}
