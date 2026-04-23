import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunStepsTable } from '@opspilot/db';

import type { WorkflowRunStepReadRepository } from '../../../application/repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStep } from '../../../domain/workflows/workflow-run-step.js';
import {
  isWorkflowRunStepStatus,
  type WorkflowRunStepStatus,
} from '../../../domain/workflows/workflow-run-step-status.js';

function mapWorkflowRunStepStatus(value: string): WorkflowRunStepStatus {
  if (!isWorkflowRunStepStatus(value)) {
    throw new Error(`Unknown workflow run step status: ${value}`);
  }

  return value;
}

function mapRowToWorkflowRunStep(row: {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workflowStepDefinitionId: string;
  readonly sequenceNumber: number;
  readonly status: string;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
}): WorkflowRunStep {
  return {
    id: row.id,
    workflowRunId: row.workflowRunId,
    workflowStepDefinitionId: row.workflowStepDefinitionId,
    sequenceNumber: row.sequenceNumber,
    status: mapWorkflowRunStepStatus(row.status),
    ...(row.startedAt !== null ? { startedAtIso: row.startedAt.toISOString() } : {}),
    ...(row.completedAt !== null ? { completedAtIso: row.completedAt.toISOString() } : {}),
  };
}

export class DrizzleWorkflowRunStepReadRepository implements WorkflowRunStepReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findById(runStepId: string): Promise<WorkflowRunStep | null> {
    const rows = await this.connection.db
      .select({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      })
      .from(workflowRunStepsTable)
      .where(eq(workflowRunStepsTable.id, runStepId))
      .limit(1);

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }

  public async listByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunStep[]> {
    const rows = await this.connection.db
      .select({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      })
      .from(workflowRunStepsTable)
      .where(eq(workflowRunStepsTable.workflowRunId, workflowRunId))
      .orderBy(asc(workflowRunStepsTable.sequenceNumber));

    return rows.map(mapRowToWorkflowRunStep);
  }
}
