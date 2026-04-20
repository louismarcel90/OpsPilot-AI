export const WORKFLOW_RUN_STEP_STATUS_VALUES = [
  'pending',
  'ready',
  'running',
  'completed',
  'failed',
  'blocked',
] as const;

export type WorkflowRunStepStatus = (typeof WORKFLOW_RUN_STEP_STATUS_VALUES)[number];

export function isWorkflowRunStepStatus(value: string): value is WorkflowRunStepStatus {
  return WORKFLOW_RUN_STEP_STATUS_VALUES.includes(value as WorkflowRunStepStatus);
}
