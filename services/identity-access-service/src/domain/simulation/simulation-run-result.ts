export type SimulationRunStatus = 'passed' | 'failed';

export interface SimulationRunCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly message: string;
}

export interface SimulationRunResult {
  readonly scenarioSlug: string;
  readonly status: SimulationRunStatus;
  readonly workflowRunId?: string;
  readonly checks: SimulationRunCheck[];
  readonly summary: string;
}
