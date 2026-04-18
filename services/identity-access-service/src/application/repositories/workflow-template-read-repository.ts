import type { WorkflowTemplateSummary } from '../../domain/workflows/workflow-template-summary.js';

export interface WorkflowTemplateReadRepository {
  listAll(): Promise<WorkflowTemplateSummary[]>;

  findBySlug(slug: string): Promise<WorkflowTemplateSummary | null>;

  findById(workflowTemplateId: string): Promise<WorkflowTemplateSummary | null>;
}
