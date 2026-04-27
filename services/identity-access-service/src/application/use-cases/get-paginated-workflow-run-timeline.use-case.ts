import type { WorkflowRuntimeTimelineCursor } from '../../domain/workflows/workflow-runtime-timeline-cursor.js';
import type { WorkflowRuntimeTimelinePage } from '../../domain/workflows/workflow-runtime-timeline-page.js';
import { projectPaginatedWorkflowRuntimeTimeline } from '../../infrastructure/workflows/project-paginated-workflow-runtime-timeline.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetPaginatedWorkflowRunTimelineUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly limit: number;
    readonly cursor: WorkflowRuntimeTimelineCursor | null;
  }): Promise<WorkflowRuntimeTimelinePage | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      return null;
    }

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id);

    return projectPaginatedWorkflowRuntimeTimeline({
      workflowRunId: workflowRun.id,
      events,
      limit: input.limit,
      cursor: input.cursor,
    });
  }
}
