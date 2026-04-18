export const WORKFLOW_STEP_TYPE_VALUES = [
  'human_task',
  'ai_task',
  'tool_task',
  'approval_gate',
] as const;

export type WorkflowStepType = (typeof WORKFLOW_STEP_TYPE_VALUES)[number];

export function isWorkflowStepType(value: string): value is WorkflowStepType {
  return WORKFLOW_STEP_TYPE_VALUES.includes(value as WorkflowStepType);
}
