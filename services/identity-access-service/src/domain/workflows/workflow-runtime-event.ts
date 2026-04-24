import type { WorkflowRuntimeEventType } from './workflow-runtime-event-type.js';

export interface WorkflowRuntimeEvent {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workspaceId: string;
  readonly eventType: WorkflowRuntimeEventType;
  readonly occurredAtIso: string;
  readonly payload: Record<string, string | number | boolean | null>;
}
