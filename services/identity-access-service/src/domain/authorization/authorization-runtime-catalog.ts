import { WORKSPACE_ROLE_VALUES } from './role-catalog.js';
import { WORKSPACE_SCOPE_VALUES } from './workspace-scope-catalog.js';
import { getWorkspaceRoleScopes } from './workspace-scope-mapping.js';

export interface AuthorizationRuntimeCatalog {
  readonly roles: string[];
  readonly scopes: string[];
  readonly roleScopes: Array<{
    readonly roleCode: string;
    readonly scopeCode: string;
  }>;
}

export function createAuthorizationRuntimeCatalog(): AuthorizationRuntimeCatalog {
  return {
    roles: [...WORKSPACE_ROLE_VALUES],
    scopes: [...WORKSPACE_SCOPE_VALUES],
    roleScopes: WORKSPACE_ROLE_VALUES.flatMap((roleCode) =>
      getWorkspaceRoleScopes(roleCode).map((scopeCode) => ({
        roleCode,
        scopeCode,
      })),
    ),
  };
}
