import type { TenantSummary } from '../../domain/identity/tenant-summary.js';
import type { TenantReadRepository } from '../repositories/tenant-read-repository.js';

export interface ResolveTenantBySlugInput {
  readonly slug: string;
}

export class ResolveTenantBySlugUseCase {
  public constructor(private readonly tenantReadRepository: TenantReadRepository) {}

  public async execute(input: ResolveTenantBySlugInput): Promise<TenantSummary | null> {
    return this.tenantReadRepository.findBySlug(input.slug);
  }
}
