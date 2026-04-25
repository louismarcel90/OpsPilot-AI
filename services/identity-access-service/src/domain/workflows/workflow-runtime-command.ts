export const WORKFLOW_RUNTIME_COMMAND_TYPE_VALUES = [
  'start_workflow_run',
  'start_workflow_run_step',
  'complete_workflow_run_step',
  'wait_for_approval',
  'no_op',
] as const;

export type WorkflowRuntimeCommandType = (typeof WORKFLOW_RUNTIME_COMMAND_TYPE_VALUES)[number];

export interface WorkflowRuntimeCommand {
  readonly commandType: WorkflowRuntimeCommandType;
  readonly workflowRunId: string;
  readonly workflowRunStepId?: string;
  readonly reason: string;
}
