import type { DeniedRuntimeActionSummary } from '../../domain/runtime/denied-runtime-action-summary.js';
import { projectDeniedRuntimeActions } from '../../infrastructure/runtime/project-denied-runtime-actions.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetDeniedRuntimeActionsUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<DeniedRuntimeActionSummary | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id);

    return projectDeniedRuntimeActions({
      workflowRunId: workflowRun.id,
      events,
    });
  }
}
