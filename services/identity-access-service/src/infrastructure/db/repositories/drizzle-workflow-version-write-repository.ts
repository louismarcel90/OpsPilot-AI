import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowVersionsTable } from '@opspilot/db';

import type { WorkflowVersionWriteRepository } from '../../../application/repositories/workflow-version-write-repository.js';
import type { WorkflowVersionLifecycleStatus } from '../../../domain/workflows/workflow-version-lifecycle.js';
import type { WorkflowVersionSummary } from '../../../domain/workflows/workflow-version-summary.js';
import { isWorkflowVersionLifecycleStatus } from '../../../domain/workflows/workflow-version-lifecycle.js';

function mapLifecycleStatus(value: string): WorkflowVersionLifecycleStatus {
  if (!isWorkflowVersionLifecycleStatus(value)) {
    throw new Error(`Unknown workflow version lifecycle status: ${value}`);
  }

  return value;
}

export class DrizzleWorkflowVersionWriteRepository implements WorkflowVersionWriteRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async updateLifecycleStatus(input: {
    readonly versionId: string;
    readonly lifecycleStatus: WorkflowVersionLifecycleStatus;
  }): Promise<void> {
    await this.connection.db
      .update(workflowVersionsTable)
      .set({
        lifecycleStatus: input.lifecycleStatus,
      })
      .where(eq(workflowVersionsTable.id, input.versionId));
  }

  public async publishVersionTransition(input: {
    readonly targetVersionId: string;
    readonly previousPublishedVersionId?: string;
  }): Promise<void> {
    await this.connection.db.transaction(async (transaction) => {
      if (input.previousPublishedVersionId !== undefined) {
        await transaction
          .update(workflowVersionsTable)
          .set({
            lifecycleStatus: 'deprecated',
          })
          .where(eq(workflowVersionsTable.id, input.previousPublishedVersionId));
      }

      await transaction
        .update(workflowVersionsTable)
        .set({
          lifecycleStatus: 'published',
        })
        .where(eq(workflowVersionsTable.id, input.targetVersionId));
    });
  }

  public async findById(versionId: string): Promise<WorkflowVersionSummary | null> {
    const rows = await this.connection.db
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
      .where(eq(workflowVersionsTable.id, versionId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      workflowTemplateId: row.workflowTemplateId,
      versionNumber: row.versionNumber,
      lifecycleStatus: mapLifecycleStatus(row.lifecycleStatus),
      triggerMode: row.triggerMode,
      definitionSummary: row.definitionSummary,
      changeSummary: row.changeSummary,
    };
  }
}
