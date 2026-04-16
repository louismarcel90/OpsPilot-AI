import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowVersionsTable } from '@opspilot/db';

import type { WorkflowVersionReadRepository } from '../../../application/repositories/workflow-version-read-repository.js';
import type { WorkflowVersionSummary } from '../../../domain/workflows/workflow-version-summary.js';
import {
  isWorkflowVersionLifecycleStatus,
  type WorkflowVersionLifecycleStatus,
} from '../../../domain/workflows/workflow-version-lifecycle.js';

function mapLifecycleStatus(value: string): WorkflowVersionLifecycleStatus {
  if (!isWorkflowVersionLifecycleStatus(value)) {
    throw new Error(`Unknown workflow version lifecycle status: ${value}`);
  }

  return value;
}

export class DrizzleWorkflowVersionReadRepository implements WorkflowVersionReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowVersionSummary[]> {
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
      .where(eq(workflowVersionsTable.workflowTemplateId, workflowTemplateId))
      .orderBy(asc(workflowVersionsTable.versionNumber));

    return rows.map((row) => ({
      id: row.id,
      workflowTemplateId: row.workflowTemplateId,
      versionNumber: row.versionNumber,
      lifecycleStatus: mapLifecycleStatus(row.lifecycleStatus),
      triggerMode: row.triggerMode,
      definitionSummary: row.definitionSummary,
      changeSummary: row.changeSummary,
    }));
  }

  public async findPublishedByWorkflowTemplateId(
    workflowTemplateId: string,
  ): Promise<WorkflowVersionSummary | null> {
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
      .where(eq(workflowVersionsTable.workflowTemplateId, workflowTemplateId))
      .orderBy(asc(workflowVersionsTable.versionNumber));

    const publishedRows = rows.filter(
      (row) => mapLifecycleStatus(row.lifecycleStatus) === 'published',
    );

    const publishedRow = publishedRows.at(-1);

    if (!publishedRow) {
      return null;
    }

    return {
      id: publishedRow.id,
      workflowTemplateId: publishedRow.workflowTemplateId,
      versionNumber: publishedRow.versionNumber,
      lifecycleStatus: mapLifecycleStatus(publishedRow.lifecycleStatus),
      triggerMode: publishedRow.triggerMode,
      definitionSummary: publishedRow.definitionSummary,
      changeSummary: publishedRow.changeSummary,
    };
  }
}
