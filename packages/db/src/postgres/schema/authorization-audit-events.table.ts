import { boolean, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const authorizationAuditEventsTable = pgTable(
  'authorization_audit_events',
  {
    eventId: text('event_id').primaryKey(),
    eventType: text('event_type').notNull(),
    source: text('source').notNull(),
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
    };
  },
);
