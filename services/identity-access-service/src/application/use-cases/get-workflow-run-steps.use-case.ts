import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

export class GetWorkflowRunStepsUseCase {
  public constructor(
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRunStep[]> {
    return this.workflowRunStepReadRepository.listByWorkflowRunId(runId);
  }
}
