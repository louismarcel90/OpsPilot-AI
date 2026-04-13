import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { assistantDefinitionsTable } from './assistant-definitions.table.js';
import { assistantVersionsTable } from './assistant-versions.table.js';

export const assistantPublicationEventsTable = pgTable(
  'assistant_publication_events',
  {
    id: text('id').primaryKey(),
    assistantId: text('assistant_id')
      .notNull()
      .references(() => assistantDefinitionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    assistantSlug: varchar('assistant_slug', { length: 120 }).notNull(),
    publishedVersionId: text('published_version_id')
      .notNull()
      .references(() => assistantVersionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    publishedVersionNumber: integer('published_version_number').notNull(),
    deprecatedVersionId: text('deprecated_version_id').references(() => assistantVersionsTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
    deprecatedVersionNumber: integer('deprecated_version_number'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  },
  (table) => {
    return {
      assistantPublicationEventsAssistantIdIndex: index(
        'assistant_publication_events_assistant_id_idx',
      ).on(table.assistantId),
      assistantPublicationEventsAssistantSlugIndex: index(
        'assistant_publication_events_assistant_slug_idx',
      ).on(table.assistantSlug),
      assistantPublicationEventsOccurredAtIndex: index(
        'assistant_publication_events_occurred_at_idx',
      ).on(table.occurredAt),
    };
  },
);
