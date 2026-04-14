import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowVersionsTable } from '@opspilot/db';

import type { WorkflowVersionReadRepository } from '../../../application/repositories/workflow-version-read-repository.js';
import type { WorkflowVersionSummary } from '../../../domain/workflows/workflow-version-summary.js';

export class DrizzleWorkflowVersionReadRepository implements WorkflowVersionReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowVersionSummary[]> {
    return this.connection.db
      .select({
        id: workflowVersionsTable.id,
        workflowTemplateId: workflowVersionsTable.workflowTemplateId,
        versionNumber: workflowVersionsTable.versionNumber,
        lifecycleStatus: workflowVersionsTable.lifecycleStatus,
        triggerMode: workflowVersionsTable.triggerMode,
        definitionSummary: workflowVersionsTable.definitionSummary,
        changeSummary: workflowVersionsTable.changeSummary,
      })
      .from(workflowVersionsTable)
      .where(eq(workflowVersionsTable.workflowTemplateId, workflowTemplateId))
      .orderBy(asc(workflowVersionsTable.versionNumber));
  }
}
