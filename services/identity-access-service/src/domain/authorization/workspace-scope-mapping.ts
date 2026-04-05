import type { WorkspaceRoleCode } from './role-catalog.js';
import type { WorkspaceScope } from './workspace-scope-catalog.js';

const WORKSPACE_ROLE_SCOPE_MAP: Record<WorkspaceRoleCode, WorkspaceScope[]> = {
  workspace_viewer: ['workspace.read', 'workspace.members.read'],
  workspace_operator: ['workspace.read', 'workspace.operate', 'workspace.members.read'],
  workspace_admin: [
    'workspace.read',
    'workspace.operate',
    'workspace.members.read',
    'workspace.members.manage',
    'workspace.admin',
  ],
};

export function getWorkspaceRoleScopes(roleCode: WorkspaceRoleCode): WorkspaceScope[] {
  return WORKSPACE_ROLE_SCOPE_MAP[roleCode];
}

export function hasWorkspaceScope(
  roleCode: WorkspaceRoleCode,
  requiredScope: WorkspaceScope,
): boolean {
  return getWorkspaceRoleScopes(roleCode).includes(requiredScope);
}
