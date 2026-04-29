export const SIMULATION_SCENARIO_CATEGORY_VALUES = [
  'workflow_runtime',
  'approval_runtime',
  'authorization_runtime',
  'realtime_runtime',
  'failure_runtime',
] as const;

export type SimulationScenarioCategory = (typeof SIMULATION_SCENARIO_CATEGORY_VALUES)[number];

export function isSimulationScenarioCategory(value: string): value is SimulationScenarioCategory {
  return SIMULATION_SCENARIO_CATEGORY_VALUES.includes(value as SimulationScenarioCategory);
}
