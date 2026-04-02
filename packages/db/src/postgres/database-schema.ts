import { membershipsTable } from './schema/memberships.table.js';
import { tenantsTable } from './schema/tenants.table.js';
import { usersTable } from './schema/users.table.js';
import { workspacesTable } from './schema/workspaces.table.js';

export const databaseSchema = {
  users: usersTable,
  tenants: tenantsTable,
  workspaces: workspacesTable,
  memberships: membershipsTable,
};
