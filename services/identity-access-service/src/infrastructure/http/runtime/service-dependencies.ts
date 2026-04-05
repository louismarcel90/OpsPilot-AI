import type { TenantReadRepository } from '../../../application/repositories/tenant-read-repository.js';
import type { UserReadRepository } from '../../../application/repositories/user-read-repository.js';
import type { WorkspaceMembershipReadRepository } from '../../../application/repositories/workspace-membership-read-repository.js';
import { ResolveTenantBySlugUseCase } from '../../../application/use-cases/resolve-tenant-by-slug.use-case.js';
import { ResolveUserByEmailUseCase } from '../../../application/use-cases/resolve-user-by-email.use-case.js';
import { ResolveWorkspaceMembershipUseCase } from '../../../application/use-cases/resolve-workspace-membership.use-case.js';

export interface ServiceDependencies {
  readonly resolveUserByEmailUseCase: ResolveUserByEmailUseCase;
  readonly resolveTenantBySlugUseCase: ResolveTenantBySlugUseCase;
  readonly resolveWorkspaceMembershipUseCase: ResolveWorkspaceMembershipUseCase;
}

export function createServiceDependencies(
  userReadRepository: UserReadRepository,
  tenantReadRepository: TenantReadRepository,
  workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
): ServiceDependencies {
  return {
    resolveUserByEmailUseCase: new ResolveUserByEmailUseCase(userReadRepository),
    resolveTenantBySlugUseCase: new ResolveTenantBySlugUseCase(tenantReadRepository),
    resolveWorkspaceMembershipUseCase: new ResolveWorkspaceMembershipUseCase(
      workspaceMembershipReadRepository,
    ),
  };
}
