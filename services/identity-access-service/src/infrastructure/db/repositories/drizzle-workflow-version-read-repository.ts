import { asc, eq, and } from 'drizzle-orm';

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

function mapRowToWorkflowVersionSummary(row: {
  readonly id: string;
  readonly workflowTemplateId: string;
  readonly versionNumber: number;
  readonly lifecycleStatus: string;
  readonly triggerMode: string;
  readonly definitionSummary: string;
  readonly changeSummary: string;
}): WorkflowVersionSummary {
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

    return rows.map(mapRowToWorkflowVersionSummary);
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

    return mapRowToWorkflowVersionSummary(publishedRow);
  }

  public async findByWorkflowTemplateIdAndVersionNumber(input: {
    readonly workflowTemplateId: string;
    readonly versionNumber: number;
  }): Promise<WorkflowVersionSummary | null> {
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
      .where(
        and(
          eq(workflowVersionsTable.workflowTemplateId, input.workflowTemplateId),
          eq(workflowVersionsTable.versionNumber, input.versionNumber),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return mapRowToWorkflowVersionSummary(row);
  }

  public async findById(workflowVersionId: string): Promise<WorkflowVersionSummary | null> {
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
      .where(eq(workflowVersionsTable.id, workflowVersionId))
      .limit(1);

    const row = rows[0];
    return row ? mapRowToWorkflowVersionSummary(row) : null;
  }
}
