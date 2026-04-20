import { randomUUID } from 'node:crypto';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunsTable } from '@opspilot/db';

import type { WorkflowRunWriteRepository } from '../../../application/repositories/workflow-run-write-repository.js';
import type { WorkflowRun } from '../../../domain/workflows/workflow-run.js';

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
}
