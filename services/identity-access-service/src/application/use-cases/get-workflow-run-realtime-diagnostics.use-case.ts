import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { RealtimeChannelDiagnostics } from '../../domain/realtime/realtime-channel-diagnostics.js';
import { createWorkflowRunRealtimeTopic } from '../../domain/realtime/realtime-event-topic.js';
import type { InMemoryRealtimeEventHub } from '../../infrastructure/realtime/in-memory-realtime-event-hub.js';

export class GetWorkflowRunRealtimeDiagnosticsUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly realtimeEventHub: InMemoryRealtimeEventHub,
  ) {}

  public async execute(runId: string): Promise<RealtimeChannelDiagnostics | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const topic = createWorkflowRunRealtimeTopic(workflowRun.id);

    return this.realtimeEventHub.getTopicDiagnostics(topic);
  }
}
