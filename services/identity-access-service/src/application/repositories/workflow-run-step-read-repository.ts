import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

export interface WorkflowRunStepReadRepository {
  listByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunStep[]>;
}
