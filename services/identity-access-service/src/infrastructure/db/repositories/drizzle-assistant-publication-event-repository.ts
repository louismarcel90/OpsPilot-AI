import { desc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { assistantPublicationEventsTable } from '@opspilot/db';

import type { AssistantPublicationEventRepository } from '../../../application/repositories/assistant-publication-event-repository.js';
import type { AssistantPublicationEvent } from '../../../domain/assistants/assistant-publication-event.js';

export class DrizzleAssistantPublicationEventRepository implements AssistantPublicationEventRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async append(event: AssistantPublicationEvent): Promise<void> {
    await this.connection.db.insert(assistantPublicationEventsTable).values({
      id: event.id,
      assistantId: event.assistantId,
      assistantSlug: event.assistantSlug,
      publishedVersionId: event.publishedVersionId,
      publishedVersionNumber: event.publishedVersionNumber,
      deprecatedVersionId: event.deprecatedVersionId,
      deprecatedVersionNumber: event.deprecatedVersionNumber,
      occurredAt: new Date(event.occurredAtIso),
    });
  }

  public async listByAssistantId(assistantId: string): Promise<AssistantPublicationEvent[]> {
    const rows = await this.connection.db
      .select({
        id: assistantPublicationEventsTable.id,
        assistantId: assistantPublicationEventsTable.assistantId,
        assistantSlug: assistantPublicationEventsTable.assistantSlug,
        publishedVersionId: assistantPublicationEventsTable.publishedVersionId,
        publishedVersionNumber: assistantPublicationEventsTable.publishedVersionNumber,
        deprecatedVersionId: assistantPublicationEventsTable.deprecatedVersionId,
        deprecatedVersionNumber: assistantPublicationEventsTable.deprecatedVersionNumber,
        occurredAt: assistantPublicationEventsTable.occurredAt,
      })
      .from(assistantPublicationEventsTable)
      .where(eq(assistantPublicationEventsTable.assistantId, assistantId))
      .orderBy(desc(assistantPublicationEventsTable.occurredAt));

    return rows.map((row) => ({
      id: row.id,
      assistantId: row.assistantId,
      assistantSlug: row.assistantSlug,
      publishedVersionId: row.publishedVersionId,
      publishedVersionNumber: row.publishedVersionNumber,
      ...(row.deprecatedVersionId !== null ? { deprecatedVersionId: row.deprecatedVersionId } : {}),
      ...(row.deprecatedVersionNumber !== null
        ? { deprecatedVersionNumber: row.deprecatedVersionNumber }
        : {}),
      occurredAtIso: row.occurredAt.toISOString(),
    }));
  }

  public async findLatestByAssistantId(
    assistantId: string,
  ): Promise<AssistantPublicationEvent | null> {
    const rows = await this.connection.db
      .select({
        id: assistantPublicationEventsTable.id,
        assistantId: assistantPublicationEventsTable.assistantId,
        assistantSlug: assistantPublicationEventsTable.assistantSlug,
        publishedVersionId: assistantPublicationEventsTable.publishedVersionId,
        publishedVersionNumber: assistantPublicationEventsTable.publishedVersionNumber,
        deprecatedVersionId: assistantPublicationEventsTable.deprecatedVersionId,
        deprecatedVersionNumber: assistantPublicationEventsTable.deprecatedVersionNumber,
        occurredAt: assistantPublicationEventsTable.occurredAt,
      })
      .from(assistantPublicationEventsTable)
      .where(eq(assistantPublicationEventsTable.assistantId, assistantId))
      .orderBy(desc(assistantPublicationEventsTable.occurredAt))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      assistantId: row.assistantId,
      assistantSlug: row.assistantSlug,
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
