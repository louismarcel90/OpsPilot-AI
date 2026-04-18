import { desc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowPublicationEventsTable } from '@opspilot/db';

import type { WorkflowPublicationEventRepository } from '../../../application/use-cases/workflow-publication-event-repository.js';
import type { WorkflowPublicationEvent } from '../../../domain/workflows/workflow-publication-event.js';

export class DrizzleWorkflowPublicationEventRepository implements WorkflowPublicationEventRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async append(event: WorkflowPublicationEvent): Promise<void> {
    await this.connection.db.insert(workflowPublicationEventsTable).values({
      id: event.id,
      workflowTemplateId: event.workflowTemplateId,
      workflowSlug: event.workflowSlug,
      publishedVersionId: event.publishedVersionId,
      publishedVersionNumber: event.publishedVersionNumber,
      deprecatedVersionId: event.deprecatedVersionId,
      deprecatedVersionNumber: event.deprecatedVersionNumber,
      occurredAt: new Date(event.occurredAtIso),
    });
  }

  public async listByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowPublicationEvent[]> {
    const rows = await this.connection.db
      .select({
        id: workflowPublicationEventsTable.id,
        workflowTemplateId: workflowPublicationEventsTable.workflowTemplateId,
        workflowSlug: workflowPublicationEventsTable.workflowSlug,
        publishedVersionId: workflowPublicationEventsTable.publishedVersionId,
        publishedVersionNumber: workflowPublicationEventsTable.publishedVersionNumber,
        deprecatedVersionId: workflowPublicationEventsTable.deprecatedVersionId,
        deprecatedVersionNumber: workflowPublicationEventsTable.deprecatedVersionNumber,
        occurredAt: workflowPublicationEventsTable.occurredAt,
      })
      .from(workflowPublicationEventsTable)
      .where(eq(workflowPublicationEventsTable.workflowTemplateId, workflowTemplateId))
      .orderBy(desc(workflowPublicationEventsTable.occurredAt));

    return rows.map((row) => ({
      id: row.id,
      workflowTemplateId: row.workflowTemplateId,
      workflowSlug: row.workflowSlug,
      publishedVersionId: row.publishedVersionId,
      publishedVersionNumber: row.publishedVersionNumber,
      ...(row.deprecatedVersionId !== null ? { deprecatedVersionId: row.deprecatedVersionId } : {}),
      ...(row.deprecatedVersionNumber !== null
        ? { deprecatedVersionNumber: row.deprecatedVersionNumber }
        : {}),
      occurredAtIso: row.occurredAt.toISOString(),
    }));
  }

  public async findLatestByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowPublicationEvent | null> {
    const rows = await this.connection.db
      .select({
        id: workflowPublicationEventsTable.id,
        workflowTemplateId: workflowPublicationEventsTable.workflowTemplateId,
        workflowSlug: workflowPublicationEventsTable.workflowSlug,
        publishedVersionId: workflowPublicationEventsTable.publishedVersionId,
        publishedVersionNumber: workflowPublicationEventsTable.publishedVersionNumber,
        deprecatedVersionId: workflowPublicationEventsTable.deprecatedVersionId,
        deprecatedVersionNumber: workflowPublicationEventsTable.deprecatedVersionNumber,
        occurredAt: workflowPublicationEventsTable.occurredAt,
      })
      .from(workflowPublicationEventsTable)
      .where(eq(workflowPublicationEventsTable.workflowTemplateId, workflowTemplateId))
      .orderBy(desc(workflowPublicationEventsTable.occurredAt))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      workflowTemplateId: row.workflowTemplateId,
      workflowSlug: row.workflowSlug,
      publishedVersionId: row.publishedVersionId,
      publishedVersionNumber: row.publishedVersionNumber,
      ...(row.deprecatedVersionId !== null ? { deprecatedVersionId: row.deprecatedVersionId } : {}),
      ...(row.deprecatedVersionNumber !== null
        ? { deprecatedVersionNumber: row.deprecatedVersionNumber }
        : {}),
      occurredAtIso: row.occurredAt.toISOString(),
    };
  }
}
