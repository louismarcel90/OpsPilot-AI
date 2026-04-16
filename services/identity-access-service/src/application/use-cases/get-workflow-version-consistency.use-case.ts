import type { WorkflowVersionConsistencyCheck } from '../../domain/workflows/workflow-version-consistency-check.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import { evaluateWorkflowVersionConsistency } from '../../infrastructure/workflows/evaluate-workflow-version-consistency.js';

export class GetWorkflowVersionConsistencyUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<WorkflowVersionConsistencyCheck | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(slug);

    if (workflowTemplate === null) {
      return null;
    }

    const versions = await this.workflowVersionReadRepository.listByWorkflowTemplateId(
      workflowTemplate.id,
    );

    return evaluateWorkflowVersionConsistency({
      workflowTemplateId: workflowTemplate.id,
      workflowSlug: workflowTemplate.slug,
      versions,
    });
  }
}
