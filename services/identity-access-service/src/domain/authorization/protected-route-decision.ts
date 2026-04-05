import type { WorkspaceCapabilityDecision } from './workspace-capability-decision.js';

export type ProtectedRouteDecisionStatus =
  | 'allowed'
  | 'denied_missing_headers'
  | 'denied_user_not_found'
  | 'denied_tenant_not_found'
  | 'denied_workspace_not_found'
  | 'denied_membership_not_found'
  | 'denied_invalid_role'
  | 'denied_missing_scope';

export interface AllowedProtectedRouteDecision {
  readonly status: 'allowed';
  readonly capabilityDecision: Extract<WorkspaceCapabilityDecision, { readonly status: 'allowed' }>;
}

export interface DeniedProtectedRouteDecision {
  readonly status:
    | 'denied_missing_headers'
    | 'denied_user_not_found'
    | 'denied_tenant_not_found'
    | 'denied_workspace_not_found'
    | 'denied_membership_not_found'
    | 'denied_invalid_role'
    | 'denied_missing_scope';
  readonly message: string;
}

export type ProtectedRouteDecision = AllowedProtectedRouteDecision | DeniedProtectedRouteDecision;
