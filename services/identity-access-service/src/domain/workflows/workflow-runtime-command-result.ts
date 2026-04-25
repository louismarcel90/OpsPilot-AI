import type { WorkflowRuntimeCommand } from './workflow-runtime-command.js';

export interface WorkflowRuntimeCommandResult {
  readonly command: WorkflowRuntimeCommand;
  readonly executed: boolean;
  readonly message: string;
}
