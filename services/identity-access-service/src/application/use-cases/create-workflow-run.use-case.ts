import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';

export class CreateWorkflowRunUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly workspaceId: string;
  }): Promise<WorkflowRun> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    if (workflowTemplate === null) {
      throw new Error('Workflow template was not found.');
    }

    const publishedVersion =
      await this.workflowVersionReadRepository.findPublishedByWorkflowTemplateId(
        workflowTemplate.id,
      );

    if (publishedVersion === null) {
      throw new Error('Workflow template has no published version.');
    }

    const stepDefinitions = await this.workflowStepReadRepository.listByWorkflowVersionId(
      publishedVersion.id,
    );

    if (stepDefinitions.length === 0) {
      throw new Error('Published workflow version has no step definitions.');
    }

    const workflowRun = await this.workflowRunWriteRepository.create({
      workflowVersionId: publishedVersion.id,
      workspaceId: input.workspaceId,
    });

    await this.workflowRunStepWriteRepository.createInitialRunSteps({
      workflowRunId: workflowRun.id,
      stepDefinitions: stepDefinitions.map((stepDefinition) => ({
        workflowStepDefinitionId: stepDefinition.id,
        sequenceNumber: stepDefinition.sequenceNumber,
      })),
    });

    return workflowRun;
  }
}
