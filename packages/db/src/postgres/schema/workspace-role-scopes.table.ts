import { index, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

import { workspaceRolesTable } from './workspace-roles.table.js';
import { workspaceScopesTable } from './workspace-scopes.table.js';

export const workspaceRoleScopesTable = pgTable(
  'workspace_role_scopes',
  {
    roleCode: varchar('role_code', { length: 50 })
      .notNull()
      .references(() => workspaceRolesTable.code, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    scopeCode: varchar('scope_code', { length: 80 })
      .notNull()
      .references(() => workspaceScopesTable.code, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      workspaceRoleScopesPrimaryKey: primaryKey({
        columns: [table.roleCode, table.scopeCode],
      }),
      workspaceRoleScopesRoleCodeIndex: index('workspace_role_scopes_role_code_idx').on(
        table.roleCode,
      ),
      workspaceRoleScopesScopeCodeIndex: index('workspace_role_scopes_scope_code_idx').on(
        table.scopeCode,
      ),
    };
  },
);
