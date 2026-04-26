import type { WorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import type { WorkflowRuntimeEventType } from '../../domain/workflows/workflow-runtime-event-type.js';
import type { WorkflowRuntimeFilteredTimeline } from '../../domain/workflows/workflow-runtime-filtered-timeline.js';
import { projectFilteredWorkflowRuntimeTimeline } from '../../infrastructure/workflows/project-filtered-workflow-runtime-timeline.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetFilteredWorkflowRunTimelineUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly eventTypes: WorkflowRuntimeEventType[];
    readonly categories: WorkflowRuntimeEventCategory[];
    readonly limit: number;
  }): Promise<WorkflowRuntimeFilteredTimeline | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      return null;
    }

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id);

    return projectFilteredWorkflowRuntimeTimeline({
      workflowRunId: workflowRun.id,
      events,
      eventTypes: input.eventTypes,
      categories: input.categories,
      limit: input.limit,
    });
  }
}
