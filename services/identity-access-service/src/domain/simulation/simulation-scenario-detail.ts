import type { SimulationScenarioExecutionPlan } from './simulation-scenario-execution-plan.js';
import type { SimulationScenario } from './simulation-scenario.js';

export interface SimulationScenarioDetail {
  readonly scenario: SimulationScenario;
  readonly executionPlan: SimulationScenarioExecutionPlan;
}
