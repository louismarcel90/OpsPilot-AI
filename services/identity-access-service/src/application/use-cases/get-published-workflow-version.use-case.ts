import type { WorkflowVersionSummary } from '../../domain/workflows/workflow-version-summary.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';

export interface PublishedWorkflowVersionView {
  readonly workflowTemplateId: string;
  readonly workflowSlug: string;
  readonly publishedVersion: WorkflowVersionSummary | null;
}

export class GetPublishedWorkflowVersionUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
  ) {}

  public async execute(slug: string): Promise<PublishedWorkflowVersionView | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(slug);

    if (workflowTemplate === null) {
      return null;
    }

    const publishedVersion =
      await this.workflowVersionReadRepository.findPublishedByWorkflowTemplateId(
        workflowTemplate.id,
      );

    return {
      workflowTemplateId: workflowTemplate.id,
      workflowSlug: workflowTemplate.slug,
      publishedVersion,
    };
  }
}
