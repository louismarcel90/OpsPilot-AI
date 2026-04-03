import { and, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { membershipsTable } from '@opspilot/db';

import type { WorkspaceMembershipReadRepository } from '../../../application/repositories/workspace-membership-read-repository.js';
import type { WorkspaceMembershipSummary } from '../../../domain/identity/workspace-membership-summary.js';

export class DrizzleWorkspaceMembershipReadRepository implements WorkspaceMembershipReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findWorkspaceMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembershipSummary | null> {
    const rows = await this.connection.db
      .select({
        membershipId: membershipsTable.id,
        tenantId: membershipsTable.tenantId,
        workspaceId: membershipsTable.workspaceId,
        userId: membershipsTable.userId,
        roleCode: membershipsTable.roleCode,
      })
      .from(membershipsTable)
      .where(
        and(eq(membershipsTable.workspaceId, workspaceId), eq(membershipsTable.userId, userId)),
      )
      .limit(1);

    return rows[0] ?? null;
  }
}
