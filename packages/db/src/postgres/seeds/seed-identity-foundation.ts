import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '../create-postgres-connection.js';
import { membershipsTable } from '../schema/memberships.table.js';
import { tenantsTable } from '../schema/tenants.table.js';
import { usersTable } from '../schema/users.table.js';
import { workspacesTable } from '../schema/workspaces.table.js';
import { seedAssistantFoundation } from './seed-assistant-foundation.js';
import { seedWorkflowFoundation } from './seed-workflow-foundation.js';
import { seedWorkspaceAuthorizationCatalog } from './seed-workspace-authorization-catalog.js';

const SEED_IDS = {
  userAlice: 'usr_alice_001',
  userBob: 'usr_bob_001',
  tenantAcme: 'ten_acme_001',
  workspaceOperations: 'wrk_ops_001',
  workspaceSecurity: 'wrk_sec_001',
  membershipAliceOps: 'mem_alice_ops_001',
  membershipBobSecurity: 'mem_bob_sec_001',
} as const;

export async function seedIdentityFoundation(connection: PostgresConnection): Promise<void> {
  await seedWorkspaceAuthorizationCatalog(connection);

  await connection.db
    .insert(usersTable)
    .values([
      {
        id: SEED_IDS.userAlice,
        email: 'alice@acme.test',
        displayName: 'Alice Johnson',
        isActive: true,
      },
      {
        id: SEED_IDS.userBob,
        email: 'bob@acme.test',
        displayName: 'Bob Smith',
        isActive: true,
      },
    ])
    .onConflictDoNothing({ target: usersTable.id });

  await connection.db
    .insert(tenantsTable)
    .values([
      {
        id: SEED_IDS.tenantAcme,
        slug: 'acme',
        displayName: 'Acme Corporation',
        isActive: true,
        createdByActorId: SEED_IDS.userAlice,
        updatedByActorId: SEED_IDS.userAlice,
      },
    ])
    .onConflictDoNothing({ target: tenantsTable.id });

  await connection.db
    .insert(workspacesTable)
    .values([
      {
        id: SEED_IDS.workspaceOperations,
        tenantId: SEED_IDS.tenantAcme,
        slug: 'operations',
        displayName: 'Operations',
        isActive: true,
        createdByActorId: SEED_IDS.userAlice,
        updatedByActorId: SEED_IDS.userAlice,
      },
      {
        id: SEED_IDS.workspaceSecurity,
        tenantId: SEED_IDS.tenantAcme,
        slug: 'security',
        displayName: 'Security',
        isActive: true,
        createdByActorId: SEED_IDS.userAlice,
        updatedByActorId: SEED_IDS.userAlice,
      },
    ])
    .onConflictDoNothing({ target: workspacesTable.id });

  await connection.db
    .insert(membershipsTable)
    .values([
      {
        id: SEED_IDS.membershipAliceOps,
        tenantId: SEED_IDS.tenantAcme,
        workspaceId: SEED_IDS.workspaceOperations,
        userId: SEED_IDS.userAlice,
        roleCode: 'workspace_admin',
        createdByActorId: SEED_IDS.userAlice,
        updatedByActorId: SEED_IDS.userAlice,
      },
      {
        id: SEED_IDS.membershipBobSecurity,
        tenantId: SEED_IDS.tenantAcme,
        workspaceId: SEED_IDS.workspaceSecurity,
        userId: SEED_IDS.userBob,
        roleCode: 'workspace_operator',
        createdByActorId: SEED_IDS.userAlice,
        updatedByActorId: SEED_IDS.userAlice,
      },
    ])
    .onConflictDoNothing({ target: membershipsTable.id });

  await seedAssistantFoundation(connection);
  await seedWorkflowFoundation(connection);

  const existingTenant = await connection.db
    .select({
      id: tenantsTable.id,
    })
    .from(tenantsTable)
    .where(eq(tenantsTable.id, SEED_IDS.tenantAcme))
    .limit(1);

  if (existingTenant.length !== 1) {
    throw new Error('Identity foundation seed verification failed.');
  }
}
