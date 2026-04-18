import type { WorkflowVersionStructureView } from '../../domain/workflows/workflow-version-structure-view.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';

export class GetWorkflowVersionStructureUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<WorkflowVersionStructureView | null> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    if (workflowTemplate === null) {
      return null;
    }

    const workflowVersion =
      await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
        workflowTemplateId: workflowTemplate.id,
        versionNumber: input.versionNumber,
      });

    if (workflowVersion === null) {
      return null;
    }

    const steps = await this.workflowStepReadRepository.listByWorkflowVersionId(workflowVersion.id);

    return {
      workflowTemplate,
      workflowVersion,
      steps,
    };
  }
}
