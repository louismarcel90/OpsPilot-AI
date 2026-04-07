import { desc } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { authorizationAuditEventsTable } from '@opspilot/db';

import type { AuthorizationAuditEventRepository } from '../../../application/repositories/authorization-audit-event-repository.js';
import type { AuthorizationAuditEvent } from '../../../domain/authorization/authorization-audit-event.js';

export class DrizzleAuthorizationAuditEventRepository implements AuthorizationAuditEventRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async append(event: AuthorizationAuditEvent): Promise<void> {
    await this.connection.db.insert(authorizationAuditEventsTable).values({
      eventId: event.eventId,
      eventType: event.eventType,
      source: event.source,
      isAligned: event.isAligned,
      createdAt: event.createdAt,
      parityReport: event.parityReport,
    });
  }

  public async listRecent(limit: number): Promise<AuthorizationAuditEvent[]> {
    const rows = await this.connection.db
      .select({
        eventId: authorizationAuditEventsTable.eventId,
        eventType: authorizationAuditEventsTable.eventType,
        source: authorizationAuditEventsTable.source,
        isAligned: authorizationAuditEventsTable.isAligned,
        createdAt: authorizationAuditEventsTable.createdAt,
        parityReport: authorizationAuditEventsTable.parityReport,
      })
      .from(authorizationAuditEventsTable)
      .orderBy(desc(authorizationAuditEventsTable.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      eventId: row.eventId,
      eventType: row.eventType as AuthorizationAuditEvent['eventType'],
      source: row.source as AuthorizationAuditEvent['source'],
      isAligned: row.isAligned,
      createdAt: row.createdAt,
      parityReport: row.parityReport as AuthorizationAuditEvent['parityReport'],
    }));
  }
}
