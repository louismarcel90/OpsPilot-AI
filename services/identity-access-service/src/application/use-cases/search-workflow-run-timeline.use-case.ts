import { projectSearchableWorkflowRuntimeTimeline } from '../../infrastructure/workflows/project-searchable-workflow-runtime-timeline.js';
import type { WorkflowRuntimeSearchFilter } from '../../domain/workflows/workflow-runtime-search-filter.js';
import type { WorkflowRuntimeSearchResult } from '../../domain/workflows/workflow-runtime-search-result.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class SearchWorkflowRunTimelineUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly filter: WorkflowRuntimeSearchFilter;
  }): Promise<WorkflowRuntimeSearchResult | null> {
    const run = await this.workflowRunReadRepository.findById(input.runId);

    if (!run) return null;

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(run.id);

    return projectSearchableWorkflowRuntimeTimeline({
      workflowRunId: run.id,
      events,
      filter: input.filter,
    });
  }
}
