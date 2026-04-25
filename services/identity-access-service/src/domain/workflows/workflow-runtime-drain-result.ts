import type { WorkflowRuntimeCommandResult } from './workflow-runtime-command-result.js';

export type WorkflowRuntimeDrainStopReason =
  | 'waiting_for_approval'
  | 'terminal_state_reached'
  | 'no_action_available'
  | 'max_commands_reached';

export interface WorkflowRuntimeDrainResult {
  readonly workflowRunId: string;
  readonly executedCommandCount: number;
  readonly attemptedCommandCount: number;
  readonly maxCommands: number;
  readonly stopReason: WorkflowRuntimeDrainStopReason;
  readonly commandResults: WorkflowRuntimeCommandResult[];
}
