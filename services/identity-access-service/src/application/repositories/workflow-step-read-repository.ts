import type { WorkflowStepDefinitionSummary } from '../../domain/workflows/workflow-step-definition-summary.js';

export interface WorkflowStepReadRepository {
  listByWorkflowVersionId(workflowVersionId: string): Promise<WorkflowStepDefinitionSummary[]>;
}
