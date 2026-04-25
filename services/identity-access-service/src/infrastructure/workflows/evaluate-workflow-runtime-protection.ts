import type {
  WorkflowRuntimeProtectionDiagnostics,
  WorkflowRuntimeProtectionLevel,
} from '../../domain/workflows/workflow-runtime-protection-diagnostics.js';
import type { WorkflowRuntimeProtectedAction } from '../../domain/workflows/workflow-runtime-protected-action.js';

function resolveProtectionLevel(
  action: WorkflowRuntimeProtectedAction,
): WorkflowRuntimeProtectionLevel {
  if (action === 'approve_approval_request' || action === 'reject_approval_request') {
    return 'approval_decider';
  }

  if (
    action === 'fail_workflow_run' ||
    action === 'fail_workflow_run_step' ||
    action === 'complete_workflow_run'
  ) {
    return 'admin';
  }

  if (action === 'drain_workflow_run') {
    return 'system';
  }

  return 'operator';
}

function isSensitiveAction(action: WorkflowRuntimeProtectedAction): boolean {
  return (
    action === 'drain_workflow_run' ||
    action === 'fail_workflow_run' ||
    action === 'fail_workflow_run_step' ||
    action === 'approve_approval_request' ||
    action === 'reject_approval_request'
  );
}

function requiresApprovalAuthority(action: WorkflowRuntimeProtectedAction): boolean {
  return action === 'approve_approval_request' || action === 'reject_approval_request';
}

function resolveReason(action: WorkflowRuntimeProtectedAction): string {
  if (action === 'drain_workflow_run') {
    return 'Drain executes multiple bounded runtime commands and must be treated as a system-level operation.';
  }

  if (action === 'approve_approval_request') {
    return 'Approval decisions require explicit approval authority.';
  }

  if (action === 'reject_approval_request') {
    return 'Approval rejection can fail the workflow run and requires explicit approval authority.';
  }

  if (action === 'fail_workflow_run') {
    return 'Failing a workflow run is a destructive runtime transition.';
  }

  if (action === 'fail_workflow_run_step') {
    return 'Failing a workflow run step propagates failure to the workflow run.';
  }

  if (action === 'complete_workflow_run') {
    return 'Completing a workflow run bypasses normal step-level completion and requires elevated control.';
  }

  return 'Runtime action requires operator-level workflow execution control.';
}

export function evaluateWorkflowRuntimeProtection(input: {
  readonly action: WorkflowRuntimeProtectedAction;
  readonly workflowRunId: string;
}): WorkflowRuntimeProtectionDiagnostics {
  return {
    action: input.action,
    workflowRunId: input.workflowRunId,
    protectionLevel: resolveProtectionLevel(input.action),
    isSensitive: isSensitiveAction(input.action),
    requiresAudit: true,
    requiresApprovalAuthority: requiresApprovalAuthority(input.action),
    reason: resolveReason(input.action),
  };
}
