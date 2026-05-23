import type { SimulationDiagnostics } from '../../domain/simulation/simulation-diagnostics.js';
import type { SimulationScenario } from '../../domain/simulation/simulation-scenario.js';
import type { SimulationScenarioCategory } from '../../domain/simulation/simulation-scenario-category.js';

export const EXECUTABLE_SIMULATION_SCENARIO_SLUGS = [
  'denied_runtime_action',
  'approval_happy_path',
  'approval_rejection_path',
  'workflow_step_failure',
  'realtime_snapshot_delta',
] as const;

function isExecutableScenario(slug: string): boolean {
  return EXECUTABLE_SIMULATION_SCENARIO_SLUGS.some((executableSlug) => executableSlug === slug);
}

function createEmptyCategoryCounts(): Record<SimulationScenarioCategory, number> {
  return {
    workflow_runtime: 0,
    approval_runtime: 0,
    authorization_runtime: 0,
    realtime_runtime: 0,
    failure_runtime: 0,
  };
}

export function projectSimulationDiagnostics(
  scenarios: SimulationScenario[],
): SimulationDiagnostics {
  const executableScenarioSlugs = scenarios
    .filter((scenario) => isExecutableScenario(scenario.slug))
    .map((scenario) => scenario.slug);

  const nonExecutableScenarioSlugs = scenarios
    .filter((scenario) => !isExecutableScenario(scenario.slug))
    .map((scenario) => scenario.slug);

  const categoryCounts = createEmptyCategoryCounts();

  for (const scenario of scenarios) {
    categoryCounts[scenario.category] += 1;
  }

  return {
    catalogScenarioCount: scenarios.length,
    executableScenarioCount: executableScenarioSlugs.length,
    nonExecutableScenarioCount: nonExecutableScenarioSlugs.length,
    executableScenarioSlugs,
    nonExecutableScenarioSlugs,
    categoryCounts,
    generatedAtIso: new Date().toISOString(),
  };
}
