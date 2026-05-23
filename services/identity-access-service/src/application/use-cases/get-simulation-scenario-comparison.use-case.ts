import type { SimulationScenarioComparison } from '../../domain/simulation/simulation-scenario-comparison.js';
import { SIMULATION_SCENARIO_CATALOG } from '../../infrastructure/simulation/simulation-scenario-catalog.js';
import { projectSimulationScenarioComparison } from '../../infrastructure/simulation/project-simulation-scenario-comparison.js';

export class GetSimulationScenarioComparisonUseCase {
  public async execute(): Promise<SimulationScenarioComparison> {
    return projectSimulationScenarioComparison(SIMULATION_SCENARIO_CATALOG);
  }
}
