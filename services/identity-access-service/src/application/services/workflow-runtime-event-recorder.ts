import { randomUUID } from 'node:crypto';

import type { WorkflowRuntimeEventType } from '../../domain/workflows/workflow-runtime-event-type.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';
import type { RealtimeEventPublisher } from './realtime-event-publisher.js';
import { createWorkflowRunRealtimeTopic } from '../../domain/realtime/realtime-event-topic.js';

export class WorkflowRuntimeEventRecorder {
  public constructor(
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
    private readonly realtimeEventPublisher: RealtimeEventPublisher,
  ) {}

  public async record(input: {
    readonly workflowRunId: string;
    readonly workspaceId: string;
    readonly eventType: WorkflowRuntimeEventType;
    readonly payload: Record<string, string | number | boolean | null>;
  }): Promise<void> {
    const eventId = randomUUID();
    const occurredAtIso = new Date().toISOString();

    await this.workflowRuntimeEventRepository.append({
      id: eventId,
      workflowRunId: input.workflowRunId,
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      occurredAtIso,
      payload: input.payload,
    });

    await this.realtimeEventPublisher.publish({
      id: eventId,
      topic: createWorkflowRunRealtimeTopic(input.workflowRunId),
      eventType: input.eventType,
      occurredAtIso,
      payload: {
        workflowRunId: input.workflowRunId,
        workspaceId: input.workspaceId,
        ...input.payload,
      },
    });
  }
}
