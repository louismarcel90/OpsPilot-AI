import type {
  SimulationScenarioComparison,
  SimulationScenarioComparisonItem,
} from '../../domain/simulation/simulation-scenario-comparison.js';
import type { SimulationScenario } from '../../domain/simulation/simulation-scenario.js';
import { EXECUTABLE_SIMULATION_SCENARIO_SLUGS } from './project-simulation-diagnostics.js';

function isExecutableScenario(slug: string): boolean {
  return EXECUTABLE_SIMULATION_SCENARIO_SLUGS.some((executableSlug) => executableSlug === slug);
}

function toComparisonItem(scenario: SimulationScenario): SimulationScenarioComparisonItem {
  return {
    slug: scenario.slug,
    title: scenario.title,
    category: scenario.category,
    difficulty: scenario.difficulty,
    isExecutable: isExecutableScenario(scenario.slug),
    expectedSignalCount: scenario.expectedSignals.length,
    tagCount: scenario.tags.length,
  };
}

export function projectSimulationScenarioComparison(
  scenarios: SimulationScenario[],
): SimulationScenarioComparison {
  const items = scenarios.map(toComparisonItem);

  return {
    totalScenarioCount: items.length,
    executableScenarioCount: items.filter((item) => item.isExecutable).length,
    items,
  };
}
