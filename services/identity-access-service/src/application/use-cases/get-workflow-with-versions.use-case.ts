import type { WorkflowWithVersionsView } from '../../domain/workflows/workflow-with-versions-view.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';

export class GetWorkflowWithVersionsUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<WorkflowWithVersionsView | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(slug);

    if (workflowTemplate === null) {
      return null;
    }

    const versions = await this.workflowVersionReadRepository.listByWorkflowTemplateId(
      workflowTemplate.id,
    );

    return {
      workflowTemplate,
      versions,
    };
  }
}
