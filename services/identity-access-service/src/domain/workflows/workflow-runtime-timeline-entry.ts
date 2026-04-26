import type { WorkflowRuntimeEventCategory } from './workflow-runtime-event-category.js';
import type { WorkflowRuntimeEventType } from './workflow-runtime-event-type.js';

export interface WorkflowRuntimeTimelineEntry {
  readonly eventId: string;
  readonly workflowRunId: string;
  readonly workspaceId: string;
  readonly eventType: WorkflowRuntimeEventType;
  readonly category: WorkflowRuntimeEventCategory;
  readonly occurredAtIso: string;
  readonly payload: Record<string, string | number | boolean | null>;
}
