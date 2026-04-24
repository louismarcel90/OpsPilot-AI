export interface WorkflowRunOperationalSummary {
  readonly totalStepCount: number;
  readonly pendingStepCount: number;
  readonly readyStepCount: number;
  readonly runningStepCount: number;
  readonly blockedStepCount: number;
  readonly completedStepCount: number;
  readonly failedStepCount: number;
  readonly pendingApprovalCount: number;
  readonly approvedApprovalCount: number;
  readonly rejectedApprovalCount: number;
}
