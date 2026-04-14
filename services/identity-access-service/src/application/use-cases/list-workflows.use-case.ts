import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowTemplateSummary } from '../../domain/workflows/workflow-template-summary.js';

export class ListWorkflowsUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
  ) {}

  public async execute(): Promise<WorkflowTemplateSummary[]> {
    return this.workflowTemplateReadRepository.listAll();
  }
}
