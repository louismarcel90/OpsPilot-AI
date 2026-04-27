import { resolveWorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import type { WorkflowRuntimeEvent } from '../../domain/workflows/workflow-runtime-event.js';
import type { WorkflowRuntimeSearchFilter } from '../../domain/workflows/workflow-runtime-search-filter.js';
import type { WorkflowRuntimeSearchResult } from '../../domain/workflows/workflow-runtime-search-result.js';
import type { WorkflowRuntimeTimelineEntry } from '../../domain/workflows/workflow-runtime-timeline-entry.js';

function matchesActor(event: WorkflowRuntimeEvent, actorId?: string): boolean {
  if (!actorId) return true;

  const value = event.payload['actorId'];
  return typeof value === 'string' && value === actorId;
}

function matchesAction(event: WorkflowRuntimeEvent, actions: string[]): boolean {
  if (actions.length === 0) return true;

  const value = event.payload['action'];
  return typeof value === 'string' && actions.includes(value);
}

function matchesQuery(event: WorkflowRuntimeEvent, query?: string): boolean {
  if (!query) return true;

  const lower = query.toLowerCase();

  return Object.values(event.payload).some((value) => String(value).toLowerCase().includes(lower));
}

function matchesEventType(event: WorkflowRuntimeEvent, eventTypes: string[]): boolean {
  if (eventTypes.length === 0) return true;
  return eventTypes.includes(event.eventType);
}

function matchesCategory(event: WorkflowRuntimeEvent, categories: string[]): boolean {
  if (categories.length === 0) return true;

  const category = resolveWorkflowRuntimeEventCategory(event.eventType);
  return categories.includes(category);
}

function toEntry(event: WorkflowRuntimeEvent): WorkflowRuntimeTimelineEntry {
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

export function projectSearchableWorkflowRuntimeTimeline(input: {
  readonly workflowRunId: string;
  readonly events: WorkflowRuntimeEvent[];
  readonly filter: WorkflowRuntimeSearchFilter;
}): WorkflowRuntimeSearchResult {
  const filtered = input.events
    .filter((event) => matchesActor(event, input.filter.actorId))
    .filter((event) => matchesAction(event, input.filter.actions))
    .filter((event) => matchesQuery(event, input.filter.query))
    .filter((event) => matchesEventType(event, input.filter.eventTypes))
    .filter((event) => matchesCategory(event, input.filter.categories));

  const entries = filtered.slice(0, input.filter.limit).map(toEntry);

  return {
    workflowRunId: input.workflowRunId,
    filterSummary: {
      ...(input.filter.actorId !== undefined && {
        actorId: input.filter.actorId,
      }),
      actionsCount: input.filter.actions.length,
      ...(input.filter.query !== undefined && {
        query: input.filter.query,
      }),
    },
    totalMatched: filtered.length,
    entries,
  };
}
