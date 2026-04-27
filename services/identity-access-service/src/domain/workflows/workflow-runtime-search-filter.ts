import type { WorkflowRuntimeEventType } from './workflow-runtime-event-type.js';
import type { WorkflowRuntimeEventCategory } from './workflow-runtime-event-category.js';

export interface WorkflowRuntimeSearchFilter {
  readonly actorId?: string;
  readonly actions: string[];
  readonly query?: string;
  readonly eventTypes: WorkflowRuntimeEventType[];
  readonly categories: WorkflowRuntimeEventCategory[];
  readonly limit: number;
}
