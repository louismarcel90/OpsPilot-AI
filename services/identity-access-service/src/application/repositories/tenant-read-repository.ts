import type { TenantSummary } from '../../domain/identity/tenant-summary.js';

export interface TenantReadRepository {
  findBySlug(slug: string): Promise<TenantSummary | null>;
  findById(tenantId: string): Promise<TenantSummary | null>;
}
