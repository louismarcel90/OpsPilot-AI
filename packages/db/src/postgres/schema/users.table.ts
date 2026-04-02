import { boolean, index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';

export const usersTable = pgTable(
  'users',
  {
    id: createPrimaryIdColumn(),
    email: varchar('email', { length: 320 }).notNull(),
    displayName: varchar('display_name', { length: 120 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      usersEmailUniqueIndex: uniqueIndex('users_email_unique_idx').on(table.email),
      usersActiveIndex: index('users_is_active_idx').on(table.isActive),
      usersDisplayNameIndex: index('users_display_name_idx').on(table.displayName),
    };
  },
);
