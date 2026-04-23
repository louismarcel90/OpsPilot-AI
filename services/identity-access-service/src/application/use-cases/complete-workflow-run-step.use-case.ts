import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canCompleteWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import { findNextWorkflowRunStep } from '../../infrastructure/workflows/find-next-workflow-run-step.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';

export class CompleteWorkflowRunStepUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
  ) {}

  public async execute(runStepId: string): Promise<WorkflowRunStep> {
    const workflowRunStep = await this.workflowRunStepReadRepository.findById(runStepId);

    if (workflowRunStep === null) {
      throw new Error('Workflow run step was not found.');
    }

    if (!canCompleteWorkflowRunStep(workflowRunStep.status)) {
      throw new Error(
        `Workflow run step cannot transition from "${workflowRunStep.status}" to "completed".`,
      );
    }

    const updatedRunStep = await this.workflowRunStepWriteRepository.completeRunStep(runStepId);

    if (updatedRunStep === null) {
      throw new Error('Workflow run step could not be completed.');
    }

    const allRunSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(
      updatedRunStep.workflowRunId,
    );

    const nextRunStep = findNextWorkflowRunStep(updatedRunStep, allRunSteps);

    if (nextRunStep !== null) {
      if (nextRunStep.status === 'pending') {
        const markedReady = await this.workflowRunStepWriteRepository.markRunStepReady(
          nextRunStep.id,
        );

        if (markedReady === null) {
          throw new Error('Next workflow run step could not be marked ready.');
        }
      }

      return updatedRunStep;
    }

    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during completion progression.');
    }

    const completedRun = await this.workflowRunWriteRepository.completeRun(
      updatedRunStep.workflowRunId,
    );

    if (completedRun === null) {
      throw new Error('Workflow run could not be completed after final step completion.');
    }

    return updatedRunStep;
  }
}
