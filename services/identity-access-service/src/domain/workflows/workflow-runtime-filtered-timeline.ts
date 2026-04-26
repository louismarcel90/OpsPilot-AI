import type { WorkflowRuntimeEventCategory } from './workflow-runtime-event-category.js';
import type { WorkflowRuntimeEventType } from './workflow-runtime-event-type.js';
import type { WorkflowRuntimeTimelineEntry } from './workflow-runtime-timeline-entry.js';

export interface WorkflowRuntimeFilteredTimelineFilter {
  readonly eventTypes: WorkflowRuntimeEventType[];
  readonly categories: WorkflowRuntimeEventCategory[];
  readonly limit: number;
}

export interface WorkflowRuntimeFilteredTimelineSummary {
  readonly totalSourceEventCount: number;
  readonly returnedEventCount: number;
  readonly workflowRunEventCount: number;
  readonly workflowStepEventCount: number;
  readonly approvalEventCount: number;
  readonly authorizationEventCount: number;
  readonly unknownEventCount: number;
}

export interface WorkflowRuntimeFilteredTimeline {
  readonly workflowRunId: string;
  readonly filter: WorkflowRuntimeFilteredTimelineFilter;
  readonly summary: WorkflowRuntimeFilteredTimelineSummary;
  readonly entries: WorkflowRuntimeTimelineEntry[];
}
