export type WorkflowRuntimeSecurityRiskLevel = 'low' | 'medium' | 'high';

export interface WorkflowRuntimeSecurityPostureIndicator {
  readonly code:
    | 'denied_runtime_actions_detected'
    | 'multiple_runtime_actors_detected'
    | 'rejected_approval_detected'
    | 'failed_step_detected'
    | 'runtime_invariant_violations_detected'
    | 'no_security_risk_detected';
  readonly message: string;
  readonly severity: WorkflowRuntimeSecurityRiskLevel;
}

export interface WorkflowRuntimeSecurityPosture {
  readonly workflowRunId: string;
  readonly riskLevel: WorkflowRuntimeSecurityRiskLevel;
  readonly deniedActionCount: number;
  readonly allowedActionCount: number;
  readonly authorizationDecisionCount: number;
  readonly authorizationActorCount: number;
  readonly rejectedApprovalCount: number;
  readonly failedStepCount: number;
  readonly invariantViolationCount: number;
  readonly indicators: WorkflowRuntimeSecurityPostureIndicator[];
}
