import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { workflowTemplatesTable } from './workflow-templates.table.js';
import { workflowVersionsTable } from './workflow-versions.table.js';

export const workflowPublicationEventsTable = pgTable(
  'workflow_publication_events',
  {
    id: text('id').primaryKey(),
    workflowTemplateId: text('workflow_template_id')
      .notNull()
      .references(() => workflowTemplatesTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workflowSlug: varchar('workflow_slug', { length: 120 }).notNull(),
    publishedVersionId: text('published_version_id')
      .notNull()
      .references(() => workflowVersionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    publishedVersionNumber: integer('published_version_number').notNull(),
    deprecatedVersionId: text('deprecated_version_id').references(() => workflowVersionsTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
    deprecatedVersionNumber: integer('deprecated_version_number'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  },
  (table) => {
    return {
      workflowPublicationEventsTemplateIdIndex: index(
        'workflow_publication_events_template_id_idx',
      ).on(table.workflowTemplateId),
      workflowPublicationEventsWorkflowSlugIndex: index(
        'workflow_publication_events_workflow_slug_idx',
      ).on(table.workflowSlug),
      workflowPublicationEventsOccurredAtIndex: index(
        'workflow_publication_events_occurred_at_idx',
      ).on(table.occurredAt),
    };
  },
);
