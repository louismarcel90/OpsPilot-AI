export type SimulationScenarioExecutionActor = 'operator' | 'system' | 'approver';

export type SimulationScenarioExecutionStepKind =
  | 'create_workflow_run'
  | 'advance_workflow_run'
  | 'drain_workflow_run'
  | 'approve_approval_request'
  | 'reject_approval_request'
  | 'fail_workflow_run_step'
  | 'open_realtime_stream'
  | 'fetch_realtime_snapshot'
  | 'inspect_diagnostics'
  | 'inspect_evidence';

export interface SimulationScenarioExecutionStep {
  readonly sequenceNumber: number;
  readonly actor: SimulationScenarioExecutionActor;
  readonly kind: SimulationScenarioExecutionStepKind;
  readonly title: string;
  readonly description: string;
  readonly expectedOutcome: string;
}

export interface SimulationScenarioExecutionPlan {
  readonly scenarioSlug: string;
  readonly isExecutablePreview: boolean;
  readonly steps: SimulationScenarioExecutionStep[];
}
