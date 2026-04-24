export const WORKFLOW_RUNTIME_EVENT_TYPE_VALUES = [
  'workflow_run_created',
  'workflow_run_started',
  'workflow_run_completed',
  'workflow_run_failed',
  'workflow_run_step_started',
  'workflow_run_step_completed',
  'workflow_run_step_failed',
  'workflow_run_step_blocked',
  'workflow_run_step_ready',
  'approval_request_created',
  'approval_request_approved',
  'approval_request_rejected',
] as const;

export type WorkflowRuntimeEventType = (typeof WORKFLOW_RUNTIME_EVENT_TYPE_VALUES)[number];

export function isWorkflowRuntimeEventType(value: string): value is WorkflowRuntimeEventType {
  return WORKFLOW_RUNTIME_EVENT_TYPE_VALUES.includes(value as WorkflowRuntimeEventType);
}
