import type { WorkflowRuntimeCommand } from './workflow-runtime-command.js';
import type { WorkflowEngineDiagnosticReason } from './workflow-engine-diagnostic-reason.js';
import type { WorkflowRun } from './workflow-run.js';

export interface WorkflowEngineDiagnosticsSummary {
  readonly workflowRunStatus: WorkflowRun['status'];
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

export interface WorkflowEngineDiagnostics {
  readonly workflowRunId: string;
  readonly nextCommand: WorkflowRuntimeCommand;
  readonly isExecutable: boolean;
  readonly reasons: WorkflowEngineDiagnosticReason[];
  readonly summary: WorkflowEngineDiagnosticsSummary;
}
