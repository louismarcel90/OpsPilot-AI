import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';

import type { WorkflowTemplateReadRepository } from '../repositories/workflow-template-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';

export class CreateWorkflowRunUseCase {
  public constructor(
    private readonly workflowTemplateReadRepository: WorkflowTemplateReadRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
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
      throw new Error('Workflow template not found.');
    }

    const workflowVersion =
      await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
        workflowTemplateId: workflowTemplate.id,
        versionNumber: input.workflowVersionNumber,
      });

    if (workflowVersion === null) {
      throw new Error('Workflow version not found.');
    }

    const stepDefinitions = await this.workflowStepReadRepository.listByWorkflowVersionId(
      workflowVersion.id,
    );

    if (stepDefinitions.length === 0) {
      throw new Error('Workflow has no steps.');
    }

    const workflowRun = await this.workflowRunWriteRepository.create({
      workflowVersionId: workflowVersion.id,
      workspaceId: input.workspaceId,
    });

    await this.workflowRunStepWriteRepository.createInitialRunSteps({
      workflowRunId: workflowRun.id,
      stepDefinitions: stepDefinitions.map((step) => ({
        workflowStepDefinitionId: step.id,
        sequenceNumber: step.sequenceNumber,
      })),
    });

    console.log('DEBUG createWorkflowRunUseCase', {
      workflowRunId: workflowRun.id,
      workflowVersionId: workflowVersion.id,
      stepDefinitionsCount: stepDefinitions.length,
      stepDefinitions: stepDefinitions.map((step) => ({
        id: step.id,
        sequenceNumber: step.sequenceNumber,
      })),
    });

    return workflowRun;
  }
}
