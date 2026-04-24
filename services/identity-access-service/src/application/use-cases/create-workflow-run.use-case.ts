import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';
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
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(input: {
    readonly slug: string;
    readonly versionNumber: number;
    readonly workspaceId: string;
  }): Promise<WorkflowRun> {
    const workflowTemplate = await this.workflowTemplateReadRepository.findBySlug(input.slug);

    if (workflowTemplate === null) {
      throw new Error('Workflow template was not found.');
    }

    const workflowVersion =
      await this.workflowVersionReadRepository.findByWorkflowTemplateIdAndVersionNumber({
        workflowTemplateId: workflowTemplate.id,
        versionNumber: input.versionNumber,
      });

    if (workflowVersion === null) {
      throw new Error('Workflow version was not found.');
    }

    const stepDefinitions = await this.workflowStepReadRepository.listByWorkflowVersionId(
      workflowVersion.id,
    );

    if (stepDefinitions.length === 0) {
      throw new Error('Workflow version has no step definitions.');
    }

    const workflowRun = await this.workflowRunWriteRepository.create({
      workflowVersionId: workflowVersion.id,
      workspaceId: input.workspaceId,
    });

    await this.workflowRunStepWriteRepository.createInitialRunSteps({
      workflowRunId: workflowRun.id,
      stepDefinitions: stepDefinitions.map((stepDefinition) => ({
        workflowStepDefinitionId: stepDefinition.id,
        sequenceNumber: stepDefinition.sequenceNumber,
      })),
    });

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: workflowRun.id,
      workspaceId: workflowRun.workspaceId,
      eventType: 'workflow_run_created',
      payload: {
        workflowRunId: workflowRun.id,
        workflowVersionId: workflowRun.workflowVersionId,
        workspaceId: workflowRun.workspaceId,
        status: workflowRun.status,
        stepCount: stepDefinitions.length,
      },
    });

    return workflowRun;
  }
}
