import type { RuntimeAuthorizationActivitySummary } from '../../domain/runtime/runtime-authorization-activity-summary.js';
import { projectRuntimeAuthorizationActivity } from '../../infrastructure/runtime/project-runtime-authorization-activity.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetRuntimeAuthorizationActivityUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<RuntimeAuthorizationActivitySummary | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id);

    return projectRuntimeAuthorizationActivity({
      workflowRunId: workflowRun.id,
      events,
    });
  }
}
