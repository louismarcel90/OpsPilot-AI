import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowStepDefinitionsTable } from '@opspilot/db';

import type { WorkflowStepReadRepository } from '../../../application/repositories/workflow-step-read-repository.js';
import type { WorkflowStepDefinitionSummary } from '../../../domain/workflows/workflow-step-definition-summary.js';
import {
  isWorkflowStepType,
  type WorkflowStepType,
} from '../../../domain/workflows/workflow-step-type.js';

function mapWorkflowStepType(value: string): WorkflowStepType {
  if (!isWorkflowStepType(value)) {
    throw new Error(`Unknown workflow step type: ${value}`);
  }

  return value;
}

export class DrizzleWorkflowStepReadRepository implements WorkflowStepReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listByWorkflowVersionId(
    workflowVersionId: string,
  ): Promise<WorkflowStepDefinitionSummary[]> {
    const rows = await this.connection.db
      .select({
        id: workflowStepDefinitionsTable.id,
        workflowVersionId: workflowStepDefinitionsTable.workflowVersionId,
        stepKey: workflowStepDefinitionsTable.stepKey,
        displayName: workflowStepDefinitionsTable.displayName,
        description: workflowStepDefinitionsTable.description,
        stepType: workflowStepDefinitionsTable.stepType,
        sequenceNumber: workflowStepDefinitionsTable.sequenceNumber,
        isRequired: workflowStepDefinitionsTable.isRequired,
        assistantBinding: workflowStepDefinitionsTable.assistantBinding,
        toolBinding: workflowStepDefinitionsTable.toolBinding,
        approvalRequired: workflowStepDefinitionsTable.approvalRequired,
        policyKey: workflowStepDefinitionsTable.policyKey,
      })
      .from(workflowStepDefinitionsTable)
      .where(eq(workflowStepDefinitionsTable.workflowVersionId, workflowVersionId))
      .orderBy(asc(workflowStepDefinitionsTable.sequenceNumber));

    return rows.map((row) => ({
      id: row.id,
      workflowVersionId: row.workflowVersionId,
      stepKey: row.stepKey,
      displayName: row.displayName,
      description: row.description,
      stepType: mapWorkflowStepType(row.stepType),
      sequenceNumber: row.sequenceNumber,
      isRequired: row.isRequired,
      ...(row.assistantBinding !== null ? { assistantBinding: row.assistantBinding } : {}),
      ...(row.toolBinding !== null ? { toolBinding: row.toolBinding } : {}),
      approvalRequired: row.approvalRequired,
      ...(row.policyKey !== null ? { policyKey: row.policyKey } : {}),
    }));
  }
}
