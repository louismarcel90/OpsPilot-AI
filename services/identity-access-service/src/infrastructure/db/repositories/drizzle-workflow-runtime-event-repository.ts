import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRuntimeEventsTable } from '@opspilot/db';

import type { WorkflowRuntimeEventRepository } from '../../../application/repositories/workflow-runtime-event-repository.js';
import type { WorkflowRuntimeEvent } from '../../../domain/workflows/workflow-runtime-event.js';
import {
  isWorkflowRuntimeEventType,
  type WorkflowRuntimeEventType,
} from '../../../domain/workflows/workflow-runtime-event-type.js';

function mapEventType(value: string): WorkflowRuntimeEventType {
  if (!isWorkflowRuntimeEventType(value)) {
    throw new Error(`Unknown workflow runtime event type: ${value}`);
  }

  return value;
}

function mapPayload(value: unknown): Record<string, string | number | boolean | null> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const payload: Record<string, string | number | boolean | null> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (
      typeof entry === 'string' ||
      typeof entry === 'number' ||
      typeof entry === 'boolean' ||
      entry === null
    ) {
      payload[key] = entry;
    }
  }

  return payload;
}

export class DrizzleWorkflowRuntimeEventRepository implements WorkflowRuntimeEventRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async append(event: WorkflowRuntimeEvent): Promise<void> {
    await this.connection.db.insert(workflowRuntimeEventsTable).values({
      id: event.id,
      workflowRunId: event.workflowRunId,
      workspaceId: event.workspaceId,
      eventType: event.eventType,
      occurredAt: new Date(event.occurredAtIso),
      payload: event.payload,
    });
  }

  public async listByWorkflowRunId(workflowRunId: string): Promise<WorkflowRuntimeEvent[]> {
    const rows = await this.connection.db
      .select({
        id: workflowRuntimeEventsTable.id,
        workflowRunId: workflowRuntimeEventsTable.workflowRunId,
        workspaceId: workflowRuntimeEventsTable.workspaceId,
        eventType: workflowRuntimeEventsTable.eventType,
        occurredAt: workflowRuntimeEventsTable.occurredAt,
        payload: workflowRuntimeEventsTable.payload,
      })
      .from(workflowRuntimeEventsTable)
      .where(eq(workflowRuntimeEventsTable.workflowRunId, workflowRunId))
      .orderBy(asc(workflowRuntimeEventsTable.occurredAt));

    return rows.map((row) => ({
      id: row.id,
      workflowRunId: row.workflowRunId,
      workspaceId: row.workspaceId,
      eventType: mapEventType(row.eventType),
      occurredAtIso: row.occurredAt.toISOString(),
      payload: mapPayload(row.payload),
    }));
  }
}
