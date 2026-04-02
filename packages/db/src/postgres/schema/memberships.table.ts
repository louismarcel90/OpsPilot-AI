import { index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { tenantsTable } from './tenants.table.js';
import { usersTable } from './users.table.js';
import { workspacesTable } from './workspaces.table.js';

export const membershipsTable = pgTable(
  'memberships',
  {
    id: createPrimaryIdColumn(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenantsTable.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    roleCode: varchar('role_code', { length: 50 }).notNull(),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      membershipsWorkspaceUserUniqueIndex: uniqueIndex('memberships_workspace_user_unique_idx').on(
        table.workspaceId,
        table.userId,
      ),
      membershipsTenantIdIndex: index('memberships_tenant_id_idx').on(table.tenantId),
      membershipsWorkspaceIdIndex: index('memberships_workspace_id_idx').on(table.workspaceId),
      membershipsUserIdIndex: index('memberships_user_id_idx').on(table.userId),
      membershipsRoleCodeIndex: index('memberships_role_code_idx').on(table.roleCode),
    };
  },
);
