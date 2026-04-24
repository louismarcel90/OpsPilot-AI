import type { ApprovalRequest } from '../approvals/approval-request.js';
import type { WorkflowRunStep } from './workflow-run-step.js';
import type { WorkflowRun } from './workflow-run.js';

export type WorkflowRunInvariantViolationCode =
  | 'multiple_ready_steps'
  | 'multiple_running_steps'
  | 'blocked_step_without_approval_request'
  | 'completed_run_with_incomplete_steps'
  | 'failed_run_without_failure_signal';

export interface WorkflowRunInvariantViolation {
  readonly code: WorkflowRunInvariantViolationCode;
  readonly message: string;
  readonly relatedWorkflowRunStepId?: string;
  readonly relatedApprovalRequestId?: string;
}

function countStepsByStatus(
  runSteps: WorkflowRunStep[],
  status: WorkflowRunStep['status'],
): number {
  return runSteps.filter((runStep) => runStep.status === status).length;
}

function hasApprovalRequestForRunStep(input: {
  readonly runStep: WorkflowRunStep;
  readonly approvalRequests: ApprovalRequest[];
}): boolean {
  return input.approvalRequests.some(
    (approvalRequest) => approvalRequest.workflowRunStepId === input.runStep.id,
  );
}

export function checkWorkflowRunInvariants(input: {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
}): WorkflowRunInvariantViolation[] {
  const violations: WorkflowRunInvariantViolation[] = [];

  const readyStepCount = countStepsByStatus(input.runSteps, 'ready');

  if (readyStepCount > 1) {
    violations.push({
      code: 'multiple_ready_steps',
      message: 'A sequential workflow run must not have more than one ready step.',
    });
  }

  const runningStepCount = countStepsByStatus(input.runSteps, 'running');

  if (runningStepCount > 1) {
    violations.push({
      code: 'multiple_running_steps',
      message: 'A sequential workflow run must not have more than one running step.',
    });
  }

  const blockedSteps = input.runSteps.filter((runStep) => runStep.status === 'blocked');

  for (const blockedStep of blockedSteps) {
    const hasApprovalRequest = hasApprovalRequestForRunStep({
      runStep: blockedStep,
      approvalRequests: input.approvalRequests,
    });

    if (!hasApprovalRequest) {
      violations.push({
        code: 'blocked_step_without_approval_request',
        message: 'A blocked workflow run step must have an approval request.',
        relatedWorkflowRunStepId: blockedStep.id,
      });
    }
  }

  if (input.workflowRun.status === 'completed') {
    const incompleteStep = input.runSteps.find((runStep) => runStep.status !== 'completed');

    if (incompleteStep !== undefined) {
      violations.push({
        code: 'completed_run_with_incomplete_steps',
        message: 'A completed workflow run must not contain incomplete workflow run steps.',
        relatedWorkflowRunStepId: incompleteStep.id,
      });
    }
  }

  if (input.workflowRun.status === 'failed') {
    const hasFailedStep = input.runSteps.some((runStep) => runStep.status === 'failed');

    const hasRejectedApproval = input.approvalRequests.some(
      (approvalRequest) => approvalRequest.status === 'rejected',
    );

    if (!hasFailedStep && !hasRejectedApproval) {
      violations.push({
        code: 'failed_run_without_failure_signal',
        message:
          'A failed workflow run must have at least one failed step or rejected approval request.',
      });
    }
  }

  return violations;
}
