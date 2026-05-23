import type { SimulationScenarioCategory } from './simulation-scenario-category.js';
import type { SimulationScenarioDifficulty } from './simulation-scenario.js';

export interface SimulationScenarioComparisonItem {
  readonly slug: string;
  readonly title: string;
  readonly category: SimulationScenarioCategory;
  readonly difficulty: SimulationScenarioDifficulty;
  readonly isExecutable: boolean;
  readonly expectedSignalCount: number;
  readonly tagCount: number;
}

export interface SimulationScenarioComparison {
  readonly totalScenarioCount: number;
  readonly executableScenarioCount: number;
  readonly items: SimulationScenarioComparisonItem[];
}
