import { index, integer, numeric, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { assistantDefinitionsTable } from './assistant-definitions.table.js';

export const assistantVersionsTable = pgTable(
  'assistant_versions',
  {
    id: createPrimaryIdColumn(),
    assistantId: text('assistant_id')
      .notNull()
      .references(() => assistantDefinitionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    versionNumber: integer('version_number').notNull(),
    lifecycleStatus: varchar('lifecycle_status', { length: 40 }).notNull(),
    modelKey: varchar('model_key', { length: 120 }).notNull(),
    systemInstructions: text('system_instructions').notNull(),
    temperature: numeric('temperature', {
      precision: 3,
      scale: 2,
    }).notNull(),
    maxOutputTokens: integer('max_output_tokens').notNull(),
    changeSummary: text('change_summary').notNull(),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      assistantVersionsAssistantIdIndex: index('assistant_versions_assistant_id_idx').on(
        table.assistantId,
      ),
      assistantVersionsLifecycleStatusIndex: index('assistant_versions_lifecycle_status_idx').on(
        table.lifecycleStatus,
      ),
      assistantVersionsAssistantVersionUniqueIndex: uniqueIndex(
        'assistant_versions_assistant_version_unique_idx',
      ).on(table.assistantId, table.versionNumber),
    };
  },
);
