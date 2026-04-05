import type { PersistedWorkspaceRole } from '../../domain/authorization/persisted-workspace-role.js';
import type { PersistedWorkspaceRoleScope } from '../../domain/authorization/persisted-workspace-role-scope.js';
import type { PersistedWorkspaceScope } from '../../domain/authorization/persisted-workspace-scope.js';

export interface AuthorizationCatalogReadRepository {
  listWorkspaceRoles(): Promise<PersistedWorkspaceRole[]>;
  listWorkspaceScopes(): Promise<PersistedWorkspaceScope[]>;
  listWorkspaceRoleScopes(): Promise<PersistedWorkspaceRoleScope[]>;
}
