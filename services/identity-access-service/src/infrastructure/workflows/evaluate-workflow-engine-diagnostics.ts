import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import type { WorkflowEngineDiagnosticReason } from '../../domain/workflows/workflow-engine-diagnostic-reason.js';
import type { WorkflowEngineDiagnostics } from '../../domain/workflows/workflow-engine-diagnostics.js';
import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import { resolveNextWorkflowRuntimeCommand } from './resolve-next-workflow-runtime-command.js';

function countRunStepsByStatus(
  runSteps: WorkflowRunStep[],
  status: WorkflowRunStep['status'],
): number {
  return runSteps.filter((runStep) => runStep.status === status).length;
}

function countApprovalRequestsByStatus(
  approvalRequests: ApprovalRequest[],
  status: ApprovalRequest['status'],
): number {
  return approvalRequests.filter((approvalRequest) => approvalRequest.status === status).length;
}

function hasPendingApprovalForBlockedStep(input: {
  readonly blockedStep: WorkflowRunStep;
  readonly approvalRequests: ApprovalRequest[];
}): boolean {
  return input.approvalRequests.some(
    (approvalRequest) =>
      approvalRequest.workflowRunStepId === input.blockedStep.id &&
      approvalRequest.status === 'pending',
  );
}

export function evaluateWorkflowEngineDiagnostics(input: {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
}): WorkflowEngineDiagnostics {
  const nextCommand = resolveNextWorkflowRuntimeCommand({
    workflowRun: input.workflowRun,
    runSteps: input.runSteps,
  });

  const reasons: WorkflowEngineDiagnosticReason[] = [];

  const readyStepCount = countRunStepsByStatus(input.runSteps, 'ready');
  const runningStepCount = countRunStepsByStatus(input.runSteps, 'running');

  if (readyStepCount > 1) {
    reasons.push('multiple_ready_steps_detected');
  }

  if (runningStepCount > 1) {
    reasons.push('multiple_running_steps_detected');
  }

  const blockedSteps = input.runSteps.filter((runStep) => runStep.status === 'blocked');

  for (const blockedStep of blockedSteps) {
    if (
      !hasPendingApprovalForBlockedStep({
        blockedStep,
        approvalRequests: input.approvalRequests,
      })
    ) {
      reasons.push('blocked_step_without_pending_approval');
      break;
    }
  }

  if (input.workflowRun.status === 'pending') {
    reasons.push('workflow_run_not_started');
  }

  if (input.workflowRun.status === 'completed') {
    reasons.push('workflow_run_terminal_completed');
  }

  if (input.workflowRun.status === 'failed') {
    reasons.push('workflow_run_terminal_failed');
  }

  if (nextCommand.commandType === 'wait_for_approval') {
    reasons.push('workflow_waiting_for_approval');
  }

  if (nextCommand.commandType === 'start_workflow_run_step') {
    reasons.push('ready_step_available');
  }

  if (nextCommand.commandType === 'complete_workflow_run_step') {
    reasons.push('running_step_available');
  }

  if (
    nextCommand.commandType === 'no_op' &&
    input.workflowRun.status !== 'completed' &&
    input.workflowRun.status !== 'failed'
  ) {
    reasons.push('no_actionable_step_found');
  }

  const hasSafetyViolation =
    readyStepCount > 1 ||
    runningStepCount > 1 ||
    reasons.includes('blocked_step_without_pending_approval');

  const isExecutable =
    !hasSafetyViolation &&
    (nextCommand.commandType === 'start_workflow_run' ||
      nextCommand.commandType === 'start_workflow_run_step' ||
      nextCommand.commandType === 'complete_workflow_run_step');

  return {
    workflowRunId: input.workflowRun.id,
    nextCommand,
    isExecutable,
    reasons,
    summary: {
      workflowRunStatus: input.workflowRun.status,
      pendingStepCount: countRunStepsByStatus(input.runSteps, 'pending'),
      readyStepCount,
      runningStepCount,
      blockedStepCount: countRunStepsByStatus(input.runSteps, 'blocked'),
      completedStepCount: countRunStepsByStatus(input.runSteps, 'completed'),
      failedStepCount: countRunStepsByStatus(input.runSteps, 'failed'),
      pendingApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'pending'),
      approvedApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'approved'),
      rejectedApprovalCount: countApprovalRequestsByStatus(input.approvalRequests, 'rejected'),
    },
  };
}
