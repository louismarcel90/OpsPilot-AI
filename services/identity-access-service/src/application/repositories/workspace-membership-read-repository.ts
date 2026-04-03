import type { WorkspaceMembershipSummary } from '../../domain/identity/workspace-membership-summary.js';

export interface WorkspaceMembershipReadRepository {
  findWorkspaceMembership(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMembershipSummary | null>;
}
