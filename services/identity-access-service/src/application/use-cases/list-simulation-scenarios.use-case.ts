import type { SimulationScenario } from '../../domain/simulation/simulation-scenario.js';
import type { SimulationScenarioCategory } from '../../domain/simulation/simulation-scenario-category.js';
import { SIMULATION_SCENARIO_CATALOG } from '../../infrastructure/simulation/simulation-scenario-catalog.js';

export class ListSimulationScenariosUseCase {
  public async execute(input: {
    readonly category?: SimulationScenarioCategory;
  }): Promise<SimulationScenario[]> {
    if (input.category === undefined) {
      return SIMULATION_SCENARIO_CATALOG;
    }

    return SIMULATION_SCENARIO_CATALOG.filter((scenario) => scenario.category === input.category);
  }
}
