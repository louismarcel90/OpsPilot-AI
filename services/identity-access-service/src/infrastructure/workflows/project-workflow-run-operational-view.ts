import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import type { WorkflowRunOperationalView } from '../../domain/workflows/workflow-run-operational-view.js';
import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

function countRunStepsByStatus(
  runSteps: WorkflowRunStep[],
  status: WorkflowRunStep['status'],
): number {
  return runSteps.filter((step) => step.status === status).length;
}

function countApprovalRequestsByStatus(
  approvalRequests: ApprovalRequest[],
  status: ApprovalRequest['status'],
): number {
  return approvalRequests.filter((request) => request.status === status).length;
}

export function projectWorkflowRunOperationalView(input: {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
}): WorkflowRunOperationalView {
  return {
    workflowRun: input.workflowRun,
    runSteps: input.runSteps,
    approvalRequests: input.approvalRequests,
    summary: {
      totalStepCount: input.runSteps.length,
      pendingStepCount: countRunStepsByStatus(input.runSteps, 'pending'),
      readyStepCount: countRunStepsByStatus(input.runSteps, 'ready'),
      runningStepCount: countRunStepsByStatus(input.runSteps, 'running'),
      blockedStepCount: countRunStepsByStatus(input.runSteps, 'blocked'),
      completedStepCount: countRunStepsByStatus(input.runSteps, 'completed'),
      failedStepCount: countRunStepsByStatus(input.runSteps, 'failed'),
      pendingApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'pending'),
      approvedApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'approved'),
      rejectedApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'rejected'),
    },
  };
}
