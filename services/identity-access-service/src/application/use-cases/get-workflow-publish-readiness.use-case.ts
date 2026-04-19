import type { WorkflowPublishReadinessCheck } from '../../domain/workflows/workflow-publish-readiness-check.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import { evaluateWorkflowPublishReadiness } from '../../infrastructure/workflows/evaluate-workflow-publish-readiness.js';
import { evaluateWorkflowStepConsistency } from '../../infrastructure/workflows/evaluate-workflow-step-consistency.js';

export class GetWorkflowPublishReadinessUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
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

    const targetVersion =
      workflowTemplate === null
        ? null
        : await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
            workflowTemplateId: workflowTemplate.id,
            versionNumber: input.versionNumber,
          });

    const stepConsistencyResult =
      workflowTemplate === null || targetVersion === null
        ? undefined
        : evaluateWorkflowStepConsistency({
            workflowTemplate,
            workflowVersion: targetVersion,
            steps: await this.workflowStepReadRepository.listByWorkflowVersionId(targetVersion.id),
          });

    return evaluateWorkflowPublishReadiness({
      workflowSlug: input.slug,
      requestedVersionNumber: input.versionNumber,
      workflowTemplate,
      allVersions,
      ...(stepConsistencyResult !== undefined ? { stepConsistencyResult } : {}),
    });
  }
}
