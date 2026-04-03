import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { tenantsTable } from '@opspilot/db';

import type { TenantReadRepository } from '../../../application/repositories/tenant-read-repository.js';
import type { TenantSummary } from '../../../domain/identity/tenant-summary.js';

export class DrizzleTenantReadRepository implements TenantReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findBySlug(slug: string): Promise<TenantSummary | null> {
    const rows = await this.connection.db
      .select({
        id: tenantsTable.id,
        slug: tenantsTable.slug,
        displayName: tenantsTable.displayName,
        isActive: tenantsTable.isActive,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.slug, slug))
      .limit(1);

    return rows[0] ?? null;
  }

  public async findById(tenantId: string): Promise<TenantSummary | null> {
    const rows = await this.connection.db
      .select({
        id: tenantsTable.id,
        slug: tenantsTable.slug,
        displayName: tenantsTable.displayName,
        isActive: tenantsTable.isActive,
      })
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    return rows[0] ?? null;
  }
}
