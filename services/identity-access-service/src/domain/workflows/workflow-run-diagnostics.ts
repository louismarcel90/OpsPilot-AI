import type { ApprovalRequest } from '../approvals/approval-request.js';
import type { WorkflowRunInvariantViolation } from './workflow-run-invariants.js';
import type { WorkflowRunStep } from './workflow-run-step.js';
import type { WorkflowRun } from './workflow-run.js';

export interface WorkflowRunDiagnosticsSummary {
  readonly workflowRunStatus: WorkflowRun['status'];
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

export interface WorkflowRunDiagnostics {
  readonly workflowRun: WorkflowRun;
  readonly summary: WorkflowRunDiagnosticsSummary;
  readonly isConsistent: boolean;
  readonly violationCount: number;
  readonly violations: WorkflowRunInvariantViolation[];
}

export function buildWorkflowRunDiagnostics(input: {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
  readonly violations: WorkflowRunInvariantViolation[];
}): WorkflowRunDiagnostics {
  return {
    workflowRun: input.workflowRun,
    summary: {
      workflowRunStatus: input.workflowRun.status,
      totalStepCount: input.runSteps.length,
      pendingStepCount: input.runSteps.filter((runStep) => runStep.status === 'pending').length,
      readyStepCount: input.runSteps.filter((runStep) => runStep.status === 'ready').length,
      runningStepCount: input.runSteps.filter((runStep) => runStep.status === 'running').length,
      blockedStepCount: input.runSteps.filter((runStep) => runStep.status === 'blocked').length,
      completedStepCount: input.runSteps.filter((runStep) => runStep.status === 'completed').length,
      failedStepCount: input.runSteps.filter((runStep) => runStep.status === 'failed').length,
      pendingApprovalCount: input.approvalRequests.filter(
        (approvalRequest) => approvalRequest.status === 'pending',
      ).length,
      approvedApprovalCount: input.approvalRequests.filter(
        (approvalRequest) => approvalRequest.status === 'approved',
      ).length,
      rejectedApprovalCount: input.approvalRequests.filter(
        (approvalRequest) => approvalRequest.status === 'rejected',
      ).length,
    },
    isConsistent: input.violations.length === 0,
    violationCount: input.violations.length,
    violations: input.violations,
  };
}
