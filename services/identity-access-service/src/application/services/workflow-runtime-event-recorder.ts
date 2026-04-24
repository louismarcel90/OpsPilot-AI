import { randomUUID } from 'node:crypto';

import type { WorkflowRuntimeEventType } from '../../domain/workflows/workflow-runtime-event-type.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class WorkflowRuntimeEventRecorder {
  public constructor(
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async record(input: {
    readonly workflowRunId: string;
    readonly workspaceId: string;
    readonly eventType: WorkflowRuntimeEventType;
    readonly payload: Record<string, string | number | boolean | null>;
  }): Promise<void> {
    await this.workflowRuntimeEventRepository.append({
      id: randomUUID(),
      workflowRunId: input.workflowRunId,
      workspaceId: input.workspaceId,
      eventType: input.eventType,
      occurredAtIso: new Date().toISOString(),
      payload: input.payload,
    });
  }
}
