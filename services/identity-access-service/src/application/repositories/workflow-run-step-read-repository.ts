import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

export interface WorkflowRunStepReadRepository {
  findById(runStepId: string): Promise<WorkflowRunStep | null>;
  listByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunStep[]>;
}
