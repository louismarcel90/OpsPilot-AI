import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

export interface WorkflowVersionReadRepository {
  listByWorkflowTemplateId(workflowTemplateId: string): Promise<WorkflowVersionSummary[]>;
}
