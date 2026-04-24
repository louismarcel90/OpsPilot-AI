import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetWorkflowRunTimelineUseCase {
  public constructor(
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRuntimeEvent[]> {
    return this.workflowRuntimeEventRepository.listByWorkflowRunId(runId);
  }
}
