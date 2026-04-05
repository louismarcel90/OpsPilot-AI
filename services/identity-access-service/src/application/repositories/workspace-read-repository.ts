import type { WorkspaceSummary } from '../../domain/identity/workspace-summary.js';

export interface WorkspaceReadRepository {
  findByTenantIdAndSlug(tenantId: string, workspaceSlug: string): Promise<WorkspaceSummary | null>;
  findById(workspaceId: string): Promise<WorkspaceSummary | null>;
}
