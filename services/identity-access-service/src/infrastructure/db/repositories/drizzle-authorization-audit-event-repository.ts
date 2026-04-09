import { and, desc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { authorizationAuditEventsTable } from '@opspilot/db';

import type { AuthorizationAuditEventRepository } from '../../../application/repositories/authorization-audit-event-repository.js';
import type { AuthorizationAuditEvent } from '../../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationAuditEventHistoryFilter } from '../../../domain/authorization/authorization-audit-event-history-filter.js';

export class DrizzleAuthorizationAuditEventRepository implements AuthorizationAuditEventRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async append(event: AuthorizationAuditEvent): Promise<void> {
    await this.connection.db.insert(authorizationAuditEventsTable).values({
      eventId: event.eventId,
      eventType: event.eventType,
      source: event.source,
      correlationId: event.correlationId,
      requestId: event.requestId,
      diagnosticId: event.diagnosticId,
      isAligned: event.isAligned,
      createdAt: event.createdAt,
      parityReport: event.parityReport,
    });
  }

  public async listRecent(
    filter: AuthorizationAuditEventHistoryFilter,
  ): Promise<AuthorizationAuditEvent[]> {
    const conditions = [
      filter.eventType !== undefined
        ? eq(authorizationAuditEventsTable.eventType, filter.eventType)
        : undefined,
      filter.source !== undefined
        ? eq(authorizationAuditEventsTable.source, filter.source)
        : undefined,
      filter.correlationId !== undefined
        ? eq(authorizationAuditEventsTable.correlationId, filter.correlationId)
        : undefined,
      filter.diagnosticId !== undefined
        ? eq(authorizationAuditEventsTable.diagnosticId, filter.diagnosticId)
        : undefined,
    ].filter((value) => value !== undefined);

    const rows = await this.connection.db
      .select({
        eventId: authorizationAuditEventsTable.eventId,
        eventType: authorizationAuditEventsTable.eventType,
        source: authorizationAuditEventsTable.source,
        correlationId: authorizationAuditEventsTable.correlationId,
        requestId: authorizationAuditEventsTable.requestId,
        diagnosticId: authorizationAuditEventsTable.diagnosticId,
        isAligned: authorizationAuditEventsTable.isAligned,
        createdAt: authorizationAuditEventsTable.createdAt,
        parityReport: authorizationAuditEventsTable.parityReport,
      })
      .from(authorizationAuditEventsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(authorizationAuditEventsTable.createdAt))
      .limit(filter.limit);

    return rows.map((row) => ({
      eventId: row.eventId,
      eventType: row.eventType as AuthorizationAuditEvent['eventType'],
      source: row.source as AuthorizationAuditEvent['source'],
      correlationId: row.correlationId,
      ...(row.requestId !== null ? { requestId: row.requestId } : {}),
      diagnosticId: row.diagnosticId,
      isAligned: row.isAligned,
      createdAt: row.createdAt,
      parityReport: row.parityReport as AuthorizationAuditEvent['parityReport'],
    }));
  }
}
