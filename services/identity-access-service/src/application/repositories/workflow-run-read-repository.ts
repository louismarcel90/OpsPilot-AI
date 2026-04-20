import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

export interface WorkflowRunReadRepository {
  findById(runId: string): Promise<WorkflowRun | null>;
}
