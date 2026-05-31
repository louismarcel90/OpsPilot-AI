import type { SimulationRunResult } from './simulation-run-result.js';

export interface SimulationRunRecord {
  readonly id: string;
  readonly scenarioSlug: string;
  readonly actorId: string;
  readonly status: SimulationRunResult['status'];
  readonly workflowRunId?: string;
  readonly result: SimulationRunResult;
  readonly startedAtIso: string;
  readonly completedAtIso: string;
}
