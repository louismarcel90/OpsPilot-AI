import type { AccessContext } from '../identity/access-context.js';
import type { WorkspaceRoleCode } from './role-catalog.js';
import type { WorkspaceScope } from './workspace-scope-catalog.js';

export type WorkspaceCapabilityDecisionStatus =
  | 'allowed'
  | 'denied_user_not_found'
  | 'denied_tenant_not_found'
  | 'denied_workspace_not_found'
  | 'denied_membership_not_found'
  | 'denied_invalid_role'
  | 'denied_missing_scope';

export interface AllowedWorkspaceCapabilityDecision {
  readonly status: 'allowed';
  readonly accessContext: Extract<AccessContext, { readonly status: 'resolved' }>;
  readonly actualRole: WorkspaceRoleCode;
  readonly grantedScopes: WorkspaceScope[];
  readonly requiredScope: WorkspaceScope;
}

export interface DeniedWorkspaceCapabilityDecision {
  readonly status:
    | 'denied_user_not_found'
    | 'denied_tenant_not_found'
    | 'denied_workspace_not_found'
    | 'denied_membership_not_found'
    | 'denied_invalid_role'
    | 'denied_missing_scope';
  readonly requiredScope: WorkspaceScope;
  readonly actualRole?: string;
  readonly grantedScopes?: WorkspaceScope[];
}

export type WorkspaceCapabilityDecision =
  | AllowedWorkspaceCapabilityDecision
  | DeniedWorkspaceCapabilityDecision;
