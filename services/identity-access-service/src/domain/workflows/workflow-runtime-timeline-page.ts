import type { WorkflowRuntimeTimelineEntry } from './workflow-runtime-timeline-entry.js';

export interface WorkflowRuntimeTimelinePage {
  readonly workflowRunId: string;
  readonly limit: number;
  readonly returnedEventCount: number;
  readonly hasNextPage: boolean;
  readonly nextCursor?: string;
  readonly entries: WorkflowRuntimeTimelineEntry[];
}
