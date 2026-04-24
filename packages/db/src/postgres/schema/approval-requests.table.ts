import { index, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { workflowRunsTable } from './workflow-runs.table.js';
import { workflowRunStepsTable } from './workflow-run-steps.table.js';
import { workspacesTable } from './workspaces.table.js';

export const approvalRequestsTable = pgTable(
  'approval_requests',
  {
    id: createPrimaryIdColumn(),
    workflowRunId: text('workflow_run_id')
      .notNull()
      .references(() => workflowRunsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workflowRunStepId: text('workflow_run_step_id')
      .notNull()
      .references(() => workflowRunStepsTable.id, {
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
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull(),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      approvalRequestsWorkflowRunIdIndex: index('approval_requests_workflow_run_id_idx').on(
        table.workflowRunId,
      ),
      approvalRequestsWorkflowRunStepIdIndex: index(
        'approval_requests_workflow_run_step_id_idx',
      ).on(table.workflowRunStepId),
      approvalRequestsWorkspaceIdIndex: index('approval_requests_workspace_id_idx').on(
        table.workspaceId,
      ),
      approvalRequestsStatusIndex: index('approval_requests_status_idx').on(table.status),
    };
  },
);
