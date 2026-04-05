import type { PostgresConnection } from '../create-postgres-connection.js';
import { workspaceRoleScopesTable } from '../schema/workspace-role-scopes.table.js';
import { workspaceRolesTable } from '../schema/workspace-roles.table.js';
import { workspaceScopesTable } from '../schema/workspace-scopes.table.js';

export async function seedWorkspaceAuthorizationCatalog(
  connection: PostgresConnection,
): Promise<void> {
  await connection.db
    .insert(workspaceRolesTable)
    .values([
      {
        code: 'workspace_viewer',
        displayName: 'Workspace Viewer',
        rank: 10,
        isSystem: true,
      },
      {
        code: 'workspace_operator',
        displayName: 'Workspace Operator',
        rank: 20,
        isSystem: true,
      },
      {
        code: 'workspace_admin',
        displayName: 'Workspace Admin',
        rank: 30,
        isSystem: true,
      },
    ])
    .onConflictDoNothing({ target: workspaceRolesTable.code });

  await connection.db
    .insert(workspaceScopesTable)
    .values([
      {
        code: 'workspace.read',
        displayName: 'Workspace Read',
        isSystem: true,
      },
      {
        code: 'workspace.operate',
        displayName: 'Workspace Operate',
        isSystem: true,
      },
      {
        code: 'workspace.members.read',
        displayName: 'Workspace Members Read',
        isSystem: true,
      },
      {
        code: 'workspace.members.manage',
        displayName: 'Workspace Members Manage',
        isSystem: true,
      },
      {
        code: 'workspace.admin',
        displayName: 'Workspace Admin',
        isSystem: true,
      },
    ])
    .onConflictDoNothing({ target: workspaceScopesTable.code });

  await connection.db
    .insert(workspaceRoleScopesTable)
    .values([
      {
        roleCode: 'workspace_viewer',
        scopeCode: 'workspace.read',
      },
      {
        roleCode: 'workspace_viewer',
        scopeCode: 'workspace.members.read',
      },
      {
        roleCode: 'workspace_operator',
        scopeCode: 'workspace.read',
      },
      {
        roleCode: 'workspace_operator',
        scopeCode: 'workspace.operate',
      },
      {
        roleCode: 'workspace_operator',
        scopeCode: 'workspace.members.read',
      },
      {
        roleCode: 'workspace_admin',
        scopeCode: 'workspace.read',
      },
      {
        roleCode: 'workspace_admin',
        scopeCode: 'workspace.operate',
      },
      {
        roleCode: 'workspace_admin',
        scopeCode: 'workspace.members.read',
      },
      {
        roleCode: 'workspace_admin',
        scopeCode: 'workspace.members.manage',
      },
      {
        roleCode: 'workspace_admin',
        scopeCode: 'workspace.admin',
      },
    ])
    .onConflictDoNothing({
      target: [workspaceRoleScopesTable.roleCode, workspaceRoleScopesTable.scopeCode],
    });
}
