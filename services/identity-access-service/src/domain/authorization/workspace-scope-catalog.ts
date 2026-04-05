export const WORKSPACE_SCOPE_VALUES = [
  'workspace.read',
  'workspace.operate',
  'workspace.members.read',
  'workspace.members.manage',
  'workspace.admin',
] as const;

export type WorkspaceScope = (typeof WORKSPACE_SCOPE_VALUES)[number];

export function isWorkspaceScope(value: string): value is WorkspaceScope {
  return WORKSPACE_SCOPE_VALUES.includes(value as WorkspaceScope);
}
