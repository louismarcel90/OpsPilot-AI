import { boolean, index, integer, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowVersionsTable } from './workflow-versions.table.js';

export const workflowStepDefinitionsTable = pgTable(
  'workflow_step_definitions',
  {
    id: createPrimaryIdColumn(),
    workflowVersionId: text('workflow_version_id')
      .notNull()
      .references(() => workflowVersionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    stepKey: varchar('step_key', { length: 120 }).notNull(),
    displayName: varchar('display_name', { length: 160 }).notNull(),
    description: text('description').notNull(),
    stepType: varchar('step_type', { length: 60 }).notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    isRequired: boolean('is_required').notNull().default(true),
    assistantBinding: varchar('assistant_binding', { length: 120 }),
    toolBinding: varchar('tool_binding', { length: 120 }),
    approvalRequired: boolean('approval_required').notNull().default(false),
    policyKey: varchar('policy_key', { length: 160 }),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workflowStepDefinitionsVersionIndex: index(
        'workflow_step_definitions_workflow_version_id_idx',
      ).on(table.workflowVersionId),
      workflowStepDefinitionsVersionSequenceUniqueIndex: uniqueIndex(
        'workflow_step_definitions_version_sequence_unique_idx',
      ).on(table.workflowVersionId, table.sequenceNumber),
      workflowStepDefinitionsVersionStepKeyUniqueIndex: uniqueIndex(
        'workflow_step_definitions_version_step_key_unique_idx',
      ).on(table.workflowVersionId, table.stepKey),
    };
  },
);
