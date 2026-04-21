import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

export interface WorkflowRunWriteRepository {
  create(input: {
    readonly workflowVersionId: string;
    readonly workspaceId: string;
  }): Promise<WorkflowRun>;

  startRun(runId: string): Promise<WorkflowRun | null>;

  completeRun(runId: string): Promise<WorkflowRun | null>;

  failRun(runId: string): Promise<WorkflowRun | null>;
}
