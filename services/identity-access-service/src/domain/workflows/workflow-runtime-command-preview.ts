import type { WorkflowEngineDiagnosticReason } from './workflow-engine-diagnostic-reason.js';
import type { WorkflowRuntimeCommand } from './workflow-runtime-command.js';

export type WorkflowRuntimeCommandExecutionMode = 'dry_run';

export interface WorkflowRuntimeCommandPreview {
  readonly workflowRunId: string;
  readonly executionMode: WorkflowRuntimeCommandExecutionMode;
  readonly command: WorkflowRuntimeCommand;
  readonly wouldExecute: boolean;
  readonly wouldMutateState: boolean;
  readonly reasons: WorkflowEngineDiagnosticReason[];
  readonly operatorMessage: string;
  readonly equivalentRuntimeEndpoint?: string;
}
