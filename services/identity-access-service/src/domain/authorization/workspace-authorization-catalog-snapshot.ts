import type { PersistedWorkspaceRole } from './persisted-workspace-role.js';
import type { PersistedWorkspaceRoleScope } from './persisted-workspace-role-scope.js';
import type { PersistedWorkspaceScope } from './persisted-workspace-scope.js';

export interface WorkspaceAuthorizationCatalogSnapshot {
  readonly roles: PersistedWorkspaceRole[];
  readonly scopes: PersistedWorkspaceScope[];
  readonly roleScopes: PersistedWorkspaceRoleScope[];
}
