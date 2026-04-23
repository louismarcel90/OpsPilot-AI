import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canStartWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';

export class StartWorkflowRunStepUseCase {
  public constructor(
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
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

    return updatedRunStep;
  }
}
