import { index, integer, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowTemplatesTable } from './workflow-templates.table.js';

export const workflowVersionsTable = pgTable(
  'workflow_versions',
  {
    id: createPrimaryIdColumn(),
    workflowTemplateId: text('workflow_template_id')
      .notNull()
      .references(() => workflowTemplatesTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    versionNumber: integer('version_number').notNull(),
    lifecycleStatus: varchar('lifecycle_status', { length: 40 }).notNull(),
    triggerMode: varchar('trigger_mode', { length: 60 }).notNull(),
    definitionSummary: text('definition_summary').notNull(),
    changeSummary: text('change_summary').notNull(),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workflowVersionsTemplateIdIndex: index('workflow_versions_template_id_idx').on(
        table.workflowTemplateId,
      ),
      workflowVersionsLifecycleStatusIndex: index('workflow_versions_lifecycle_status_idx').on(
        table.lifecycleStatus,
      ),
      workflowVersionsTemplateVersionUniqueIndex: uniqueIndex(
        'workflow_versions_template_version_unique_idx',
      ).on(table.workflowTemplateId, table.versionNumber),
    };
  },
);
