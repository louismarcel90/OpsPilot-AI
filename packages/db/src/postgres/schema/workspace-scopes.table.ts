import { boolean, index, pgTable, varchar } from 'drizzle-orm/pg-core';

import { createTimestampColumns } from '../shared/timestamp-columns.js';

export const workspaceScopesTable = pgTable(
  'workspace_scopes',
  {
    code: varchar('code', { length: 80 }).primaryKey(),
    displayName: varchar('display_name', { length: 160 }).notNull(),
    isSystem: boolean('is_system').notNull().default(true),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      workspaceScopesIsSystemIndex: index('workspace_scopes_is_system_idx').on(table.isSystem),
    };
  },
);
