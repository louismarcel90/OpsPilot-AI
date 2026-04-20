export const WORKFLOW_RUN_STATUS_VALUES = ['pending', 'running', 'completed', 'failed'] as const;

export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUS_VALUES)[number];

export function isWorkflowRunStatus(value: string): value is WorkflowRunStatus {
  return WORKFLOW_RUN_STATUS_VALUES.includes(value as WorkflowRunStatus);
}
