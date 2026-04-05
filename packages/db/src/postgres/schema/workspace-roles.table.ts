import { boolean, index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createTimestampColumns } from '../shared/timestamp-columns.js';

export const workspaceRolesTable = pgTable(
  'workspace_roles',
  {
    code: varchar('code', { length: 50 }).primaryKey(),
    displayName: varchar('display_name', { length: 120 }).notNull(),
    rank: integer('rank').notNull(),
    isSystem: boolean('is_system').notNull().default(true),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workspaceRolesRankIndex: index('workspace_roles_rank_idx').on(table.rank),
      workspaceRolesIsSystemIndex: index('workspace_roles_is_system_idx').on(table.isSystem),
    };
  },
);
