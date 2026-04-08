import { boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const authorizationAuditEventsTable = pgTable(
  'authorization_audit_events',
  {
    eventId: text('event_id').primaryKey(),
    eventType: text('event_type').notNull(),
    source: text('source').notNull(),
    correlationId: text('correlation_id').notNull(),
    requestId: text('request_id'),
    diagnosticId: text('diagnostic_id').notNull(),
    isAligned: boolean('is_aligned').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    parityReport: jsonb('parity_report').notNull(),
  },
  (table) => {
    return {
      authorizationAuditEventsCreatedAtIndex: index('authorization_audit_events_created_at_idx').on(
        table.createdAt,
      ),
      authorizationAuditEventsEventTypeIndex: index('authorization_audit_events_event_type_idx').on(
        table.eventType,
      ),
      authorizationAuditEventsSourceIndex: index('authorization_audit_events_source_idx').on(
        table.source,
      ),
      authorizationAuditEventsCorrelationIdIndex: index(
        'authorization_audit_events_correlation_id_idx',
      ).on(table.correlationId),
      authorizationAuditEventsDiagnosticIdIndex: index(
        'authorization_audit_events_diagnostic_id_idx',
      ).on(table.diagnosticId),
    };
  },
);
