import { index, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowRunsTable } from './workflow-runs.table.js';
import { workspacesTable } from './workspaces.table.js';

export const workflowRuntimeEventsTable = pgTable(
  'workflow_runtime_events',
  {
    id: createPrimaryIdColumn(),
    workflowRunId: text('workflow_run_id')
      .notNull()
      .references(() => workflowRunsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    eventType: varchar('event_type', { length: 120 }).notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    payload: jsonb('payload').notNull(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workflowRuntimeEventsRunIdIndex: index('workflow_runtime_events_workflow_run_id_idx').on(
        table.workflowRunId,
      ),
      workflowRuntimeEventsWorkspaceIdIndex: index('workflow_runtime_events_workspace_id_idx').on(
        table.workspaceId,
      ),
      workflowRuntimeEventsOccurredAtIndex: index('workflow_runtime_events_occurred_at_idx').on(
        table.occurredAt,
      ),
      workflowRuntimeEventsEventTypeIndex: index('workflow_runtime_events_event_type_idx').on(
        table.eventType,
      ),
    };
  },
);
