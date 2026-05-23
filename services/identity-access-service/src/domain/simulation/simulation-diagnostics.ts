import type { SimulationScenarioCategory } from './simulation-scenario-category.js';

export interface SimulationDiagnostics {
  readonly catalogScenarioCount: number;
  readonly executableScenarioCount: number;
  readonly nonExecutableScenarioCount: number;
  readonly executableScenarioSlugs: string[];
  readonly nonExecutableScenarioSlugs: string[];
  readonly categoryCounts: Record<SimulationScenarioCategory, number>;
  readonly generatedAtIso: string;
}
