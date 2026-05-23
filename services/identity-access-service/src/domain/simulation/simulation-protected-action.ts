export const SIMULATION_PROTECTED_ACTION_VALUES = ['run_simulation', 'inspect_simulation'] as const;

export type SimulationProtectedAction = (typeof SIMULATION_PROTECTED_ACTION_VALUES)[number];

export function isSimulationProtectedAction(value: string): value is SimulationProtectedAction {
  return SIMULATION_PROTECTED_ACTION_VALUES.includes(value as SimulationProtectedAction);
}
