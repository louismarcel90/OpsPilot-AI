import type { SimulationScenarioDetail } from '../../domain/simulation/simulation-scenario-detail.js';
import { SIMULATION_SCENARIO_CATALOG } from '../../infrastructure/simulation/simulation-scenario-catalog.js';
import { projectSimulationScenarioDetail } from '../../infrastructure/simulation/project-simulation-scenario-detail.js';

export class GetSimulationScenarioDetailUseCase {
  public async execute(slug: string): Promise<SimulationScenarioDetail | null> {
    const scenario =
      SIMULATION_SCENARIO_CATALOG.find((candidate) => candidate.slug === slug) ?? null;

    if (scenario === null) {
      return null;
    }

    return projectSimulationScenarioDetail(scenario);
  }
}
