import type { WorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import { resolveWorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import type { WorkflowRuntimeEventType } from '../../domain/workflows/workflow-runtime-event-type.js';
import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';
import type { WorkflowRuntimeFilteredTimeline } from '../../domain/workflows/workflow-runtime-filtered-timeline.js';
import type { WorkflowRuntimeTimelineEntry } from '../../domain/workflows/workflow-runtime-timeline-entry.js';

function includesEventTypeFilter(input: {
  readonly eventTypes: WorkflowRuntimeEventType[];
  readonly event: WorkflowRuntimeEvent;
}): boolean {
  if (input.eventTypes.length === 0) {
    return true;
  }

  return input.eventTypes.includes(input.event.eventType);
}

function includesCategoryFilter(input: {
  readonly categories: WorkflowRuntimeEventCategory[];
  readonly category: WorkflowRuntimeEventCategory;
}): boolean {
  if (input.categories.length === 0) {
    return true;
  }

  return input.categories.includes(input.category);
}

function toTimelineEntry(event: WorkflowRuntimeEvent): WorkflowRuntimeTimelineEntry {
  return {
    eventId: event.id,
    workflowRunId: event.workflowRunId,
    workspaceId: event.workspaceId,
    eventType: event.eventType,
    category: resolveWorkflowRuntimeEventCategory(event.eventType),
    occurredAtIso: event.occurredAtIso,
    payload: event.payload,
  };
}

function countEntriesByCategory(input: {
  readonly entries: WorkflowRuntimeTimelineEntry[];
  readonly category: WorkflowRuntimeEventCategory;
}): number {
  return input.entries.filter((entry) => entry.category === input.category).length;
}

export function projectFilteredWorkflowRuntimeTimeline(input: {
  readonly workflowRunId: string;
  readonly events: WorkflowRuntimeEvent[];
  readonly eventTypes: WorkflowRuntimeEventType[];
  readonly categories: WorkflowRuntimeEventCategory[];
  readonly limit: number;
}): WorkflowRuntimeFilteredTimeline {
  const filteredEntries = input.events
    .map(toTimelineEntry)
    .filter((entry) =>
      includesEventTypeFilter({
        eventTypes: input.eventTypes,
        event: {
          id: entry.eventId,
          workflowRunId: entry.workflowRunId,
          workspaceId: entry.workspaceId,
          eventType: entry.eventType,
          occurredAtIso: entry.occurredAtIso,
          payload: entry.payload,
        },
      }),
    )
    .filter((entry) =>
      includesCategoryFilter({
        categories: input.categories,
        category: entry.category,
      }),
    )
    .slice(0, input.limit);

  return {
    workflowRunId: input.workflowRunId,
    filter: {
      eventTypes: input.eventTypes,
      categories: input.categories,
      limit: input.limit,
    },
    summary: {
      totalSourceEventCount: input.events.length,
      returnedEventCount: filteredEntries.length,
      workflowRunEventCount: countEntriesByCategory({
        entries: filteredEntries,
        category: 'workflow_run',
      }),
      workflowStepEventCount: countEntriesByCategory({
        entries: filteredEntries,
        category: 'workflow_step',
      }),
      approvalEventCount: countEntriesByCategory({
        entries: filteredEntries,
        category: 'approval',
      }),
      authorizationEventCount: countEntriesByCategory({
        entries: filteredEntries,
        category: 'authorization',
      }),
      unknownEventCount: countEntriesByCategory({
        entries: filteredEntries,
        category: 'unknown',
      }),
    },
    entries: filteredEntries,
  };
}
