import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

export class CreateWorkflowRunUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
  ) {}

  public async execute(input: {
    readonly workflowSlug: string;
    readonly workflowVersionNumber: number;
    readonly workspaceId: string;
  }): Promise<WorkflowRun> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(
      input.workflowSlug,
    );

    if (workflowTemplate === null) {
      throw new Error(`Workflow template not found for slug "${input.workflowSlug}".`);
    }

    const workflowVersion =
      await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
        workflowTemplateId: workflowTemplate.id,
        versionNumber: input.workflowVersionNumber,
      });

    if (workflowVersion === null) {
      throw new Error(
        `Workflow version ${input.workflowVersionNumber} not found for workflow "${input.workflowSlug}".`,
      );
    }

    const steps = await this.workflowStepReadRepository.listByWorkflowVersionId(workflowVersion.id);

    if (steps.length === 0) {
      throw new Error(`Workflow version ${input.workflowVersionNumber} has no executable steps.`);
    }

    return this.workflowRunWriteRepository.create({
      workflowVersionId: workflowVersion.id,
      workspaceId: input.workspaceId,
    });
  }
}
