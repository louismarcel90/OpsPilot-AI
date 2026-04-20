import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

export interface WorkflowRunWriteRepository {
  create(input: {
    readonly workflowVersionId: string;
    readonly workspaceId: string;
  }): Promise<WorkflowRun>;
}
