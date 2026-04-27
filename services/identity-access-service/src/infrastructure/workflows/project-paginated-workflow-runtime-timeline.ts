import { resolveWorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';
import type { WorkflowRuntimeTimelineCursor } from '../../domain/workflows/workflow-runtime-timeline-cursor.js';
import type { WorkflowRuntimeTimelineEntry } from '../../domain/workflows/workflow-runtime-timeline-entry.js';
import type { WorkflowRuntimeTimelinePage } from '../../domain/workflows/workflow-runtime-timeline-page.js';
import { encodeWorkflowRuntimeTimelineCursor } from './workflow-runtime-timeline-cursor-codec.js';

function compareEventsByStableTimelineOrder(
  left: WorkflowRuntimeEvent,
  right: WorkflowRuntimeEvent,
): number {
  const leftOccurredAt = Date.parse(left.occurredAtIso);
  const rightOccurredAt = Date.parse(right.occurredAtIso);

  if (leftOccurredAt !== rightOccurredAt) {
    return leftOccurredAt - rightOccurredAt;
  }

  return left.id.localeCompare(right.id);
}

function isAfterCursor(input: {
  readonly event: WorkflowRuntimeEvent;
  readonly cursor: WorkflowRuntimeTimelineCursor;
}): boolean {
  const eventOccurredAt = Date.parse(input.event.occurredAtIso);
  const cursorOccurredAt = Date.parse(input.cursor.occurredAtIso);

  if (eventOccurredAt > cursorOccurredAt) {
    return true;
  }

  if (eventOccurredAt < cursorOccurredAt) {
    return false;
  }

  return input.event.id > input.cursor.eventId;
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

export function projectPaginatedWorkflowRuntimeTimeline(input: {
  readonly workflowRunId: string;
  readonly events: WorkflowRuntimeEvent[];
  readonly limit: number;
  readonly cursor: WorkflowRuntimeTimelineCursor | null;
}): WorkflowRuntimeTimelinePage {
  const sortedEvents = input.events.slice().sort(compareEventsByStableTimelineOrder);

  const cursorFilteredEvents =
    input.cursor === null
      ? sortedEvents
      : sortedEvents.filter((event) =>
          isAfterCursor({
            event,
            cursor: input.cursor as WorkflowRuntimeTimelineCursor,
          }),
        );

  const pageEvents = cursorFilteredEvents.slice(0, input.limit + 1);
  const hasNextPage = pageEvents.length > input.limit;
  const visibleEvents = pageEvents.slice(0, input.limit);
  const entries = visibleEvents.map(toTimelineEntry);
  const lastVisibleEvent = visibleEvents[visibleEvents.length - 1];

  const nextCursor =
    hasNextPage && lastVisibleEvent !== undefined
      ? encodeWorkflowRuntimeTimelineCursor({
          occurredAtIso: lastVisibleEvent.occurredAtIso,
          eventId: lastVisibleEvent.id,
        })
      : undefined;

  return {
    workflowRunId: input.workflowRunId,
    limit: input.limit,
    returnedEventCount: entries.length,
    hasNextPage,
    ...(nextCursor !== undefined ? { nextCursor } : {}),
    entries,
  };
}
