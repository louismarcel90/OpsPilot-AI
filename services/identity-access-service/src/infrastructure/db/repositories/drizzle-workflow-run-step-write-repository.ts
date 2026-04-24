import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunStepsTable } from '@opspilot/db';

import type { WorkflowRunStepWriteRepository } from '../../../application/repositories/workflow-run-step-write-repository.js';
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

export class DrizzleWorkflowRunStepWriteRepository implements WorkflowRunStepWriteRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async createInitialRunSteps(input: {
    readonly workflowRunId: string;
    readonly stepDefinitions: Array<{
      readonly workflowStepDefinitionId: string;
      readonly sequenceNumber: number;
    }>;
  }): Promise<WorkflowRunStep[]> {
    const orderedStepDefinitions = input.stepDefinitions
      .slice()
      .sort((left, right) => left.sequenceNumber - right.sequenceNumber);

    const createdSteps: WorkflowRunStep[] = orderedStepDefinitions.map((stepDefinition, index) => ({
      id: randomUUID(),
      workflowRunId: input.workflowRunId,
      workflowStepDefinitionId: stepDefinition.workflowStepDefinitionId,
      sequenceNumber: stepDefinition.sequenceNumber,
      status: index === 0 ? 'ready' : 'pending',
    }));

    await this.connection.db.insert(workflowRunStepsTable).values(
      createdSteps.map((step) => ({
        id: step.id,
        workflowRunId: step.workflowRunId,
        workflowStepDefinitionId: step.workflowStepDefinitionId,
        sequenceNumber: step.sequenceNumber,
        status: step.status,
        startedAt: null,
        completedAt: null,
      })),
    );

    return createdSteps;
  }

  public async startRunStep(runStepId: string): Promise<WorkflowRunStep | null> {
    const startedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunStepsTable)
      .set({
        status: 'running',
        startedAt,
      })
      .where(eq(workflowRunStepsTable.id, runStepId))
      .returning({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      });

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }

  public async completeRunStep(runStepId: string): Promise<WorkflowRunStep | null> {
    const completedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunStepsTable)
      .set({
        status: 'completed',
        completedAt,
      })
      .where(eq(workflowRunStepsTable.id, runStepId))
      .returning({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      });

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }

  public async failRunStep(runStepId: string): Promise<WorkflowRunStep | null> {
    const completedAt = new Date();

    const rows = await this.connection.db
      .update(workflowRunStepsTable)
      .set({
        status: 'failed',
        completedAt,
      })
      .where(eq(workflowRunStepsTable.id, runStepId))
      .returning({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      });

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }

  public async markRunStepReady(runStepId: string): Promise<WorkflowRunStep | null> {
    const rows = await this.connection.db
      .update(workflowRunStepsTable)
      .set({
        status: 'ready',
      })
      .where(eq(workflowRunStepsTable.id, runStepId))
      .returning({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      });

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }

  public async markRunStepBlocked(runStepId: string): Promise<WorkflowRunStep | null> {
    const rows = await this.connection.db
      .update(workflowRunStepsTable)
      .set({
        status: 'blocked',
      })
      .where(eq(workflowRunStepsTable.id, runStepId))
      .returning({
        id: workflowRunStepsTable.id,
        workflowRunId: workflowRunStepsTable.workflowRunId,
        workflowStepDefinitionId: workflowRunStepsTable.workflowStepDefinitionId,
        sequenceNumber: workflowRunStepsTable.sequenceNumber,
        status: workflowRunStepsTable.status,
        startedAt: workflowRunStepsTable.startedAt,
        completedAt: workflowRunStepsTable.completedAt,
      });

    const row = rows[0];
    return row ? mapRowToWorkflowRunStep(row) : null;
  }
}
