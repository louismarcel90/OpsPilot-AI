import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workflowTemplatesTable } from '@opspilot/db';

import type { WorkflowTemplateReadRepository } from '../../../application/repositories/workflow-template-read-repository.js';
import type { WorkflowTemplateSummary } from '../../../domain/workflows/workflow-template-summary.js';

export class DrizzleWorkflowTemplateReadRepository implements WorkflowTemplateReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listAll(): Promise<WorkflowTemplateSummary[]> {
    return this.connection.db
      .select({
        id: workflowTemplatesTable.id,
        tenantId: workflowTemplatesTable.tenantId,
        workspaceId: workflowTemplatesTable.workspaceId,
        slug: workflowTemplatesTable.slug,
        displayName: workflowTemplatesTable.displayName,
        description: workflowTemplatesTable.description,
        isActive: workflowTemplatesTable.isActive,
      })
      .from(workflowTemplatesTable)
      .orderBy(asc(workflowTemplatesTable.displayName));
  }

  public async findBySlug(slug: string): Promise<WorkflowTemplateSummary | null> {
    const rows = await this.connection.db
      .select({
        id: workflowTemplatesTable.id,
        tenantId: workflowTemplatesTable.tenantId,
        workspaceId: workflowTemplatesTable.workspaceId,
        slug: workflowTemplatesTable.slug,
        displayName: workflowTemplatesTable.displayName,
        description: workflowTemplatesTable.description,
        isActive: workflowTemplatesTable.isActive,
      })
      .from(workflowTemplatesTable)
      .where(eq(workflowTemplatesTable.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findById(workflowTemplateId: string): Promise<WorkflowTemplateSummary | null> {
    const rows = await this.connection.db
      .select({
        id: workflowTemplatesTable.id,
        tenantId: workflowTemplatesTable.tenantId,
        workspaceId: workflowTemplatesTable.workspaceId,
        slug: workflowTemplatesTable.slug,
        displayName: workflowTemplatesTable.displayName,
        description: workflowTemplatesTable.description,
        isActive: workflowTemplatesTable.isActive,
      })
      .from(workflowTemplatesTable)
      .where(eq(workflowTemplatesTable.id, workflowTemplateId))
      .limit(1);

    return rows[0] ?? null;
  }
}
