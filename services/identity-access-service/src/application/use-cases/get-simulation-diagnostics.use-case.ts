import type { SimulationDiagnostics } from '../../domain/simulation/simulation-diagnostics.js';
import { SIMULATION_SCENARIO_CATALOG } from '../../infrastructure/simulation/simulation-scenario-catalog.js';
import { projectSimulationDiagnostics } from '../../infrastructure/simulation/project-simulation-diagnostics.js';

export class GetSimulationDiagnosticsUseCase {
  public async execute(): Promise<SimulationDiagnostics> {
    return projectSimulationDiagnostics(SIMULATION_SCENARIO_CATALOG);
  }
}
