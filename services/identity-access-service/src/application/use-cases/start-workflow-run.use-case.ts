import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import { canStartWorkflowRun } from '../../domain/workflows/workflow-run-transition.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';

export class StartWorkflowRunUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRun> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    if (!canStartWorkflowRun(workflowRun.status)) {
      throw new Error(`Workflow run cannot transition from "${workflowRun.status}" to "running".`);
    }

    const updatedRun = await this.workflowRunWriteRepository.startRun(runId);

    if (updatedRun === null) {
      throw new Error('Workflow run could not be started.');
    }

    return updatedRun;
  }
}
