import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowTemplateSummary } from '../../domain/workflows/workflow-template-summary.js';

export class GetWorkflowBySlugUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
  ) {}

  public async execute(slug: string): Promise<WorkflowTemplateSummary | null> {
    return this.workflowTemplateReadRepository.findBySlug(slug);
  }
}
