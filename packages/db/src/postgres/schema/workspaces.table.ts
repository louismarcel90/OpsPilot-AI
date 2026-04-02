import { boolean, index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { tenantsTable } from './tenants.table.js';

export const workspacesTable = pgTable(
  'workspaces',
  {
    id: createPrimaryIdColumn(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenantsTable.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    slug: varchar('slug', { length: 80 }).notNull(),
    displayName: varchar('display_name', { length: 120 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workspacesTenantSlugUniqueIndex: uniqueIndex('workspaces_tenant_slug_unique_idx').on(
        table.tenantId,
        table.slug,
      ),
      workspacesTenantIdIndex: index('workspaces_tenant_id_idx').on(table.tenantId),
      workspacesIsActiveIndex: index('workspaces_is_active_idx').on(table.isActive),
    };
  },
);
