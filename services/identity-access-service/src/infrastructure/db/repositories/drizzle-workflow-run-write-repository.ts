import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunsTable } from '@opspilot/db';

import type { WorkflowRunWriteRepository } from '../../../application/repositories/workflow-run-write-repository.js';
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

function toIsoOrUndefined(value: Date | null): string | undefined {
  return value === null ? undefined : value.toISOString();
}

function mapRowToWorkflowRun(row: {
  readonly id: string;
  readonly workflowVersionId: string;
  readonly workspaceId: string;
  readonly status: string;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}): WorkflowRun {
  return {
    id: row.id,
    workflowVersionId: row.workflowVersionId,
    workspaceId: row.workspaceId,
    status: mapWorkflowRunStatus(row.status),
    ...(row.startedAt !== null ? { startedAt: toIsoOrUndefined(row.startedAt) } : {}),
    ...(row.completedAt !== null ? { completedAt: toIsoOrUndefined(row.completedAt) } : {}),
  };
}

export class DrizzleWorkflowRunWriteRepository implements WorkflowRunWriteRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async create(input: {
    readonly workflowVersionId: string;
    readonly workspaceId: string;
  }): Promise<WorkflowRun> {
    const runId = randomUUID();

    await this.connection.db.insert(workflowRunsTable).values({
      id: runId,
      workflowVersionId: input.workflowVersionId,
      workspaceId: input.workspaceId,
      status: 'pending',
      startedAt: null,
      completedAt: null,
    });

    return {
      id: runId,
      workflowVersionId: input.workflowVersionId,
      workspaceId: input.workspaceId,
      status: 'pending',
    };
  }

  public async startRun(runId: string): Promise<WorkflowRun | null> {
    const startedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunsTable)
      .set({
        status: 'running',
        startedAt,
      })
      .where(eq(workflowRunsTable.id, runId))
      .returning({
        id: workflowRunsTable.id,
        workflowVersionId: workflowRunsTable.workflowVersionId,
        workspaceId: workflowRunsTable.workspaceId,
        status: workflowRunsTable.status,
        startedAt: workflowRunsTable.startedAt,
        completedAt: workflowRunsTable.completedAt,
      });

    const row = rows[0];

    return row === undefined ? null : mapRowToWorkflowRun(row);
  }

  public async completeRun(runId: string): Promise<WorkflowRun | null> {
    const completedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunsTable)
      .set({
        status: 'completed',
        completedAt,
      })
      .where(eq(workflowRunsTable.id, runId))
      .returning({
        id: workflowRunsTable.id,
        workflowVersionId: workflowRunsTable.workflowVersionId,
        workspaceId: workflowRunsTable.workspaceId,
        status: workflowRunsTable.status,
        startedAt: workflowRunsTable.startedAt,
        completedAt: workflowRunsTable.completedAt,
      });

    const row = rows[0];

    return row === undefined ? null : mapRowToWorkflowRun(row);
  }

  public async failRun(runId: string): Promise<WorkflowRun | null> {
    const completedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunsTable)
      .set({
        status: 'failed',
        completedAt,
      })
      .where(eq(workflowRunsTable.id, runId))
      .returning({
        id: workflowRunsTable.id,
        workflowVersionId: workflowRunsTable.workflowVersionId,
        workspaceId: workflowRunsTable.workspaceId,
        status: workflowRunsTable.status,
        startedAt: workflowRunsTable.startedAt,
        completedAt: workflowRunsTable.completedAt,
      });

    const row = rows[0];

    return row === undefined ? null : mapRowToWorkflowRun(row);
  }
}
