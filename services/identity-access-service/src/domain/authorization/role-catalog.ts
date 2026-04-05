export const WORKSPACE_ROLE_VALUES = [
  'workspace_viewer',
  'workspace_operator',
  'workspace_admin',
] as const;

export type WorkspaceRoleCode = (typeof WORKSPACE_ROLE_VALUES)[number];

export function isWorkspaceRoleCode(value: string): value is WorkspaceRoleCode {
  return WORKSPACE_ROLE_VALUES.includes(value as WorkspaceRoleCode);
}
