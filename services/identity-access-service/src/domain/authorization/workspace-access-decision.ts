import type { AccessContext } from '../identity/access-context.js';
import type { WorkspaceRoleCode } from './role-catalog.js';

export type WorkspaceAccessDecisionStatus =
  | 'allowed'
  | 'denied_user_not_found'
  | 'denied_tenant_not_found'
  | 'denied_workspace_not_found'
  | 'denied_membership_not_found'
  | 'denied_invalid_role'
  | 'denied_insufficient_role';

export interface AllowedWorkspaceAccessDecision {
  readonly status: 'allowed';
  readonly accessContext: Extract<AccessContext, { readonly status: 'resolved' }>;
  readonly actualRole: WorkspaceRoleCode;
  readonly requiredRole: WorkspaceRoleCode;
}

export interface DeniedWorkspaceAccessDecision {
  readonly status:
    | 'denied_user_not_found'
    | 'denied_tenant_not_found'
    | 'denied_workspace_not_found'
    | 'denied_membership_not_found'
    | 'denied_invalid_role'
    | 'denied_insufficient_role';
  readonly requiredRole: WorkspaceRoleCode;
  readonly actualRole?: string;
}

export type WorkspaceAccessDecision =
  | AllowedWorkspaceAccessDecision
  | DeniedWorkspaceAccessDecision;
