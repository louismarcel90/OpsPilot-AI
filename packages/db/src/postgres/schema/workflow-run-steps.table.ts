import { index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowRunsTable } from './workflow-runs.table.js';
import { workflowStepDefinitionsTable } from './workflow-step-definitions.table.js';

export const workflowRunStepsTable = pgTable(
  'workflow_run_steps',
  {
    id: createPrimaryIdColumn(),
    workflowRunId: text('workflow_run_id')
      .notNull()
      .references(() => workflowRunsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workflowStepDefinitionId: text('workflow_step_definition_id')
      .notNull()
      .references(() => workflowStepDefinitionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    sequenceNumber: integer('sequence_number').notNull(),
    status: varchar('status', { length: 40 }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workflowRunStepsWorkflowRunIdIndex: index('workflow_run_steps_workflow_run_id_idx').on(
        table.workflowRunId,
      ),
      workflowRunStepsWorkflowStepDefinitionIdIndex: index(
        'workflow_run_steps_workflow_step_definition_id_idx',
      ).on(table.workflowStepDefinitionId),
      workflowRunStepsStatusIndex: index('workflow_run_steps_status_idx').on(table.status),
    };
  },
);
