import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunsTable } from '@opspilot/db';

import type { WorkflowRunReadRepository } from '../../../application/repositories/workflow-run-read-repository.js';
import type { WorkflowRun } from '../../../domain/workflows/workflow-run.js';
import {
  isWorkflowRunStatus,
  type WorkflowRunStatus,
} from '../../../domain/workflows/workflow-run-status.js';

function mapWorkflowRunStatus(value: string): WorkflowRunStatus {
  if (!isWorkflowRunStatus(value)) {
    throw new Error(`Unknown workflow run status: ${value}`);
  }

  return value;
}

export class DrizzleWorkflowRunReadRepository implements WorkflowRunReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findById(runId: string): Promise<WorkflowRun | null> {
    const rows = await this.connection.db
      .select({
        id: workflowRunsTable.id,
        workflowVersionId: workflowRunsTable.workflowVersionId,
        workspaceId: workflowRunsTable.workspaceId,
        status: workflowRunsTable.status,
        startedAt: workflowRunsTable.startedAt,
        completedAt: workflowRunsTable.completedAt,
      })
      .from(workflowRunsTable)
      .where(eq(workflowRunsTable.id, runId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      workflowVersionId: row.workflowVersionId,
      workspaceId: row.workspaceId,
      status: mapWorkflowRunStatus(row.status),
      ...(row.startedAt !== null ? { startedAtIso: row.startedAt.toISOString() } : {}),
      ...(row.completedAt !== null ? { completedAtIso: row.completedAt.toISOString() } : {}),
    };
  }
}
