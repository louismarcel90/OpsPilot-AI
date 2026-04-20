import { randomUUID } from 'node:crypto';

import type { PostgresConnection } from '@opspilot/db';
import { workflowRunStepsTable } from '@opspilot/db';

import type { WorkflowRunStepWriteRepository } from '../../../application/repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunStep } from '../../../domain/workflows/workflow-run-step.js';

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
}
