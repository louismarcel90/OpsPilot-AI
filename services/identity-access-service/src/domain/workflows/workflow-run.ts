import type { WorkflowRunStatus } from './workflow-run-status.js';

export interface WorkflowRun {
  readonly id: string;
  readonly workflowVersionId: string;
  readonly workspaceId: string;
  readonly status: WorkflowRunStatus;
  readonly startedAtIso?: string;
  readonly completedAtIso?: string;
}
