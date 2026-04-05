import type { TenantSummary } from './tenant-summary.js';
import type { UserSummary } from './user-summary.js';
import type { WorkspaceMembershipSummary } from './workspace-membership-summary.js';
import type { WorkspaceSummary } from './workspace-summary.js';

export type AccessContextStatus =
  | 'resolved'
  | 'user_not_found'
  | 'tenant_not_found'
  | 'workspace_not_found'
  | 'membership_not_found';

export interface ResolvedAccessContext {
  readonly status: 'resolved';
  readonly actor: UserSummary;
  readonly tenant: TenantSummary;
  readonly workspace: WorkspaceSummary;
  readonly membership: WorkspaceMembershipSummary;
}

export interface UnresolvedAccessContext {
  readonly status:
    | 'user_not_found'
    | 'tenant_not_found'
    | 'workspace_not_found'
    | 'membership_not_found';
}

export type AccessContext = ResolvedAccessContext | UnresolvedAccessContext;
