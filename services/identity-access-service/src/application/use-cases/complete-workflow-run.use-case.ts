import type { WorkflowRun } from '../../domain/workflows/workflow-run.js';
import { canCompleteWorkflowRun } from '../../domain/workflows/workflow-run-transition.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';

export class CompleteWorkflowRunUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(runId: string): Promise<WorkflowRun> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    if (!canCompleteWorkflowRun(workflowRun.status)) {
      throw new Error(
        `Workflow run cannot transition from "${workflowRun.status}" to "completed".`,
      );
    }

    const updatedRun = await this.workflowRunWriteRepository.completeRun(runId);

    if (updatedRun === null) {
      throw new Error('Workflow run could not be completed.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: updatedRun.id,
      workspaceId: updatedRun.workspaceId,
      eventType: 'workflow_run_completed',
      payload: {
        workflowRunId: updatedRun.id,
        previousStatus: workflowRun.status,
        status: updatedRun.status,
        completedAtIso: updatedRun.completedAtIso ?? null,
      },
    });

    return updatedRun;
  }
}
