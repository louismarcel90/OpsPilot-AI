import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canFailWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';

export class FailWorkflowRunStepUseCase {
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

    if (!canFailWorkflowRunStep(workflowRunStep.status)) {
      throw new Error(
        `Workflow run step cannot transition from "${workflowRunStep.status}" to "failed".`,
      );
    }

    const updatedRunStep = await this.workflowRunStepWriteRepository.failRunStep(runStepId);

    if (updatedRunStep === null) {
      throw new Error('Workflow run step could not be failed.');
    }

    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during failure propagation.');
    }

    const failedRun = await this.workflowRunWriteRepository.failRun(updatedRunStep.workflowRunId);

    if (failedRun === null) {
      throw new Error('Workflow run could not be failed after step failure.');
    }

    return updatedRunStep;
  }
}
