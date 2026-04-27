import type { WorkflowRuntimeTimelineEntry } from './workflow-runtime-timeline-entry.js';

export interface WorkflowRuntimeSearchResult {
  readonly workflowRunId: string;
  readonly filterSummary: {
    readonly actorId?: string;
    readonly actionsCount: number;
    readonly query?: string;
  };
  readonly totalMatched: number;
  readonly entries: WorkflowRuntimeTimelineEntry[];
}
