import { WORKSPACE_ROLE_VALUES, type WorkspaceRoleCode } from './role-catalog.js';
import { WORKSPACE_SCOPE_VALUES, type WorkspaceScope } from './workspace-scope-catalog.js';

export function assertWorkspaceRoleCode(value: string): WorkspaceRoleCode {
  const matchingRole = WORKSPACE_ROLE_VALUES.find((roleCode) => roleCode === value);

  if (!matchingRole) {
    throw new Error(`Unknown workspace role code: ${value}`);
  }

  return matchingRole;
}

export function assertWorkspaceScope(value: string): WorkspaceScope {
  const matchingScope = WORKSPACE_SCOPE_VALUES.find((scope) => scope === value);

  if (!matchingScope) {
    throw new Error(`Unknown workspace scope: ${value}`);
  }

  return matchingScope;
}
