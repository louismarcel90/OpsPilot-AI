import { boolean, index, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';
import { tenantsTable } from './tenants.table.js';
import { workspacesTable } from './workspaces.table.js';

export const assistantDefinitionsTable = pgTable(
  'assistant_definitions',
  {
    id: createPrimaryIdColumn(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenantsTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    slug: varchar('slug', { length: 120 }).notNull(),
    displayName: varchar('display_name', { length: 160 }).notNull(),
    description: text('description').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      assistantDefinitionsTenantIndex: index('assistant_definitions_tenant_id_idx').on(
        table.tenantId,
      ),
      assistantDefinitionsWorkspaceIndex: index('assistant_definitions_workspace_id_idx').on(
        table.workspaceId,
      ),
      assistantDefinitionsSlugUniqueIndex: uniqueIndex(
        'assistant_definitions_workspace_slug_unique_idx',
      ).on(table.workspaceId, table.slug),
    };
  },
);
