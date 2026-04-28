import type { RealtimeStreamStaleness } from '../../domain/realtime/realtime-stream-staleness.js';
import { createWorkflowRunRealtimeTopic } from '../../domain/realtime/realtime-event-topic.js';
import type { InMemoryRealtimeEventHub } from '../../infrastructure/realtime/in-memory-realtime-event-hub.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';

export class GetWorkflowRunRealtimeStalenessUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly realtimeEventHub: InMemoryRealtimeEventHub,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly staleThresholdMs: number;
  }): Promise<RealtimeStreamStaleness | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      return null;
    }

    return this.realtimeEventHub.getTopicStaleness({
      topic: createWorkflowRunRealtimeTopic(workflowRun.id),
      staleThresholdMs: input.staleThresholdMs,
    });
  }
}
