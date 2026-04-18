import type { WorkflowStepConsistencyResult } from '../../domain/workflows/workflow-step-consistency-result.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import { evaluateWorkflowStepConsistency } from '../../infrastructure/workflows/evaluate-workflow-step-consistency.js';

export class GetWorkflowStepConsistencyUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
  }): Promise<WorkflowStepConsistencyResult | null> {
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

    return evaluateWorkflowStepConsistency({
      workflowTemplate,
      workflowVersion,
      steps,
    });
  }
}
