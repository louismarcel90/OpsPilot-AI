export const WORKFLOW_RUNTIME_PROTECTED_ACTION_VALUES = [
  'advance_workflow_run',
  'drain_workflow_run',
  'start_workflow_run',
  'complete_workflow_run',
  'fail_workflow_run',
  'start_workflow_run_step',
  'complete_workflow_run_step',
  'fail_workflow_run_step',
  'approve_approval_request',
  'reject_approval_request',
] as const;

export type WorkflowRuntimeProtectedAction =
  (typeof WORKFLOW_RUNTIME_PROTECTED_ACTION_VALUES)[number];

export function isWorkflowRuntimeProtectedAction(
  value: string,
): value is WorkflowRuntimeProtectedAction {
  return WORKFLOW_RUNTIME_PROTECTED_ACTION_VALUES.includes(value as WorkflowRuntimeProtectedAction);
}
