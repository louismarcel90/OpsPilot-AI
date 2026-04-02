import { boolean, index, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { createActorAuditColumns } from '../shared/audit-columns.js';
import { createPrimaryIdColumn } from '../shared/id-columns.js';
import { createTimestampColumns } from '../shared/timestamp-columns.js';

export const tenantsTable = pgTable(
  'tenants',
  {
    id: createPrimaryIdColumn(),
    slug: varchar('slug', { length: 80 }).notNull(),
    displayName: varchar('display_name', { length: 120 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    ...createActorAuditColumns(),
    ...createTimestampColumns(),
  },
  (table) => {
    return {
      tenantsSlugUniqueIndex: uniqueIndex('tenants_slug_unique_idx').on(table.slug),
      tenantsIsActiveIndex: index('tenants_is_active_idx').on(table.isActive),
      tenantsDisplayNameIndex: index('tenants_display_name_idx').on(table.displayName),
    };
  },
);
