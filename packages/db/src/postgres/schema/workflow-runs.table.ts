import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowVersionsTable } from './workflow-versions.table.js';
import { workspacesTable } from './workspaces.table.js';

export const workflowRunsTable = pgTable(
  'workflow_runs',
  {
    id: createPrimaryIdColumn(),
    workflowVersionId: text('workflow_version_id')
      .notNull()
      .references(() => workflowVersionsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    status: varchar('status', { length: 40 }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workflowRunsWorkflowVersionIdIndex: index('workflow_runs_workflow_version_id_idx').on(
        table.workflowVersionId,
      ),
      workflowRunsWorkspaceIdIndex: index('workflow_runs_workspace_id_idx').on(table.workspaceId),
      workflowRunsStatusIndex: index('workflow_runs_status_idx').on(table.status),
    };
  },
);
