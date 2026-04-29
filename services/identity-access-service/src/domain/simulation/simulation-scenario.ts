import type { SimulationScenarioCategory } from './simulation-scenario-category.js';

export type SimulationScenarioDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface SimulationScenarioExpectedSignal {
  readonly name: string;
  readonly description: string;
}

export interface SimulationScenario {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly category: SimulationScenarioCategory;
  readonly difficulty: SimulationScenarioDifficulty;
  readonly description: string;
  readonly objective: string;
  readonly expectedSignals: SimulationScenarioExpectedSignal[];
  readonly tags: string[];
}
