import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canStartWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';

export class StartWorkflowRunStepUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(runStepId: string): Promise<WorkflowRunStep> {
    const workflowRunStep = await this.workflowRunStepReadRepository.findById(runStepId);

    if (workflowRunStep === null) {
      throw new Error('Workflow run step was not found.');
    }

    if (!canStartWorkflowRunStep(workflowRunStep.status)) {
      throw new Error(
        `Workflow run step cannot transition from "${workflowRunStep.status}" to "running".`,
      );
    }

    const updatedRunStep = await this.workflowRunStepWriteRepository.startRunStep(runStepId);

    if (updatedRunStep === null) {
      throw new Error('Workflow run step could not be started.');
    }

    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during step start event recording.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: updatedRunStep.workflowRunId,
      workspaceId: workflowRun.workspaceId,
      eventType: 'workflow_run_step_started',
      payload: {
        workflowRunId: updatedRunStep.workflowRunId,
        workflowRunStepId: updatedRunStep.id,
        workflowStepDefinitionId: updatedRunStep.workflowStepDefinitionId,
        sequenceNumber: updatedRunStep.sequenceNumber,
        previousStatus: workflowRunStep.status,
        status: updatedRunStep.status,
        startedAtIso: updatedRunStep.startedAtIso ?? null,
      },
    });

    return updatedRunStep;
  }
}
