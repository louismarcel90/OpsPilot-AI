import { asc } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { workspaceRoleScopesTable, workspaceRolesTable, workspaceScopesTable } from '@opspilot/db';

import type { AuthorizationCatalogReadRepository } from './authorization-catalog-read-repository.js';
import type { PersistedWorkspaceRole } from '../../domain/authorization/persisted-workspace-role.js';
import type { PersistedWorkspaceRoleScope } from '../../domain/authorization/persisted-workspace-role-scope.js';
import type { PersistedWorkspaceScope } from '../../domain/authorization/persisted-workspace-scope.js';

export class DrizzleAuthorizationCatalogReadRepository implements AuthorizationCatalogReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async listWorkspaceRoles(): Promise<PersistedWorkspaceRole[]> {
    return this.connection.db
      .select({
        code: workspaceRolesTable.code,
        displayName: workspaceRolesTable.displayName,
        rank: workspaceRolesTable.rank,
        isSystem: workspaceRolesTable.isSystem,
      })
      .from(workspaceRolesTable)
      .orderBy(asc(workspaceRolesTable.rank));
  }

  public async listWorkspaceScopes(): Promise<PersistedWorkspaceScope[]> {
    return this.connection.db
      .select({
        code: workspaceScopesTable.code,
        displayName: workspaceScopesTable.displayName,
        isSystem: workspaceScopesTable.isSystem,
      })
      .from(workspaceScopesTable)
      .orderBy(asc(workspaceScopesTable.code));
  }

  public async listWorkspaceRoleScopes(): Promise<PersistedWorkspaceRoleScope[]> {
    return this.connection.db
      .select({
        roleCode: workspaceRoleScopesTable.roleCode,
        scopeCode: workspaceRoleScopesTable.scopeCode,
      })
      .from(workspaceRoleScopesTable)
      .orderBy(asc(workspaceRoleScopesTable.roleCode), asc(workspaceRoleScopesTable.scopeCode));
  }
}
