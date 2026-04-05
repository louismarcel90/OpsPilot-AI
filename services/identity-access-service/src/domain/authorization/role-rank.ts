import type { WorkspaceRoleCode } from './role-catalog.js';

const WORKSPACE_ROLE_RANK: Record<WorkspaceRoleCode, number> = {
  workspace_viewer: 10,
  workspace_operator: 20,
  workspace_admin: 30,
};

export function getWorkspaceRoleRank(roleCode: WorkspaceRoleCode): number {
  return WORKSPACE_ROLE_RANK[roleCode];
}

export function hasAtLeastRequiredRole(
  actualRole: WorkspaceRoleCode,
  requiredRole: WorkspaceRoleCode,
): boolean {
  return getWorkspaceRoleRank(actualRole) >= getWorkspaceRoleRank(requiredRole);
}
