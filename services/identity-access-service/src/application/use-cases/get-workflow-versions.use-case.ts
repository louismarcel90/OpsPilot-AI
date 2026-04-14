import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';

export class GetWorkflowVersionsUseCase {
  public constructor(
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
  ) {}

  public async execute(workflowTemplateId: string): Promise<WorkflowVersionSummary[]> {
    return this.workflowVersionReadRepository.listByWorkflowTemplateId(workflowTemplateId);
  }
}
