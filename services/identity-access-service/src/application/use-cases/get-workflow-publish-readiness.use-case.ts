import type { WorkflowPublishReadinessCheck } from '../../domain/workflows/workflow-publish-readiness-check.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import { evaluateWorkflowPublishReadiness } from '../../infrastructure/workflows/evaluate-workflow-publish-readiness.js';

export class GetWorkflowPublishReadinessUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<WorkflowPublishReadinessCheck> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    const allVersions =
      workflowTemplate === null
        ? []
        : await this.workflowVersionReadRepository.listByWorkflowTemplateId(workflowTemplate.id);

    return evaluateWorkflowPublishReadiness({
      workflowSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      workflowTemplate,
      allVersions,
    });
  }
}
