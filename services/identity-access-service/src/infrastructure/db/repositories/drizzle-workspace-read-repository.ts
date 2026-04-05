import { and, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workspacesTable } from '@opspilot/db';

import type { WorkspaceReadRepository } from '../../../application/repositories/workspace-read-repository.js';
import type { WorkspaceSummary } from '../../../domain/identity/workspace-summary.js';

export class DrizzleWorkspaceReadRepository implements WorkspaceReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findByTenantIdAndSlug(
    tenantId: string,
    workspaceSlug: string,
  ): Promise<WorkspaceSummary | null> {
    const rows = await this.connection.db
      .select({
        id: workspacesTable.id,
        tenantId: workspacesTable.tenantId,
        slug: workspacesTable.slug,
        displayName: workspacesTable.displayName,
        isActive: workspacesTable.isActive,
      })
      .from(workspacesTable)
      .where(and(eq(workspacesTable.tenantId, tenantId), eq(workspacesTable.slug, workspaceSlug)))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findById(workspaceId: string): Promise<WorkspaceSummary | null> {
    const rows = await this.connection.db
      .select({
        id: workspacesTable.id,
        tenantId: workspacesTable.tenantId,
        slug: workspacesTable.slug,
        displayName: workspacesTable.displayName,
        isActive: workspacesTable.isActive,
      })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1);

    return rows[0] ?? null;
  }
}
