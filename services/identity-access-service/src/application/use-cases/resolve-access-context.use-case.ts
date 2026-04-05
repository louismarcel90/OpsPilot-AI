import type { AccessContext } from '../../domain/identity/access-context.js';
import type { TenantReadRepository } from '../repositories/tenant-read-repository.js';
import type { UserReadRepository } from '../repositories/user-read-repository.js';
import type { WorkspaceMembershipReadRepository } from '../repositories/workspace-membership-read-repository.js';
import type { WorkspaceReadRepository } from '../repositories/workspace-read-repository.js';

export interface ResolveAccessContextInput {
  readonly email: string;
  readonly tenantSlug: string;
  readonly workspaceSlug: string;
}

export class ResolveAccessContextUseCase {
  public constructor(
    private readonly userReadRepository: UserReadRepository,
    private readonly tenantReadRepository: TenantReadRepository,
    private readonly workspaceReadRepository: WorkspaceReadRepository,
    private readonly workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
  ) {}

  public async execute(input: ResolveAccessContextInput): Promise<AccessContext> {
    const user = await this.userReadRepository.findByEmail(input.email);

    if (user === null) {
      return {
        status: 'user_not_found',
      };
    }

    const tenant = await this.tenantReadRepository.findBySlug(input.tenantSlug);

    if (tenant === null) {
      return {
        status: 'tenant_not_found',
      };
    }

    const workspace = await this.workspaceReadRepository.findByTenantIdAndSlug(
      tenant.id,
      input.workspaceSlug,
    );

    if (workspace === null) {
      return {
        status: 'workspace_not_found',
      };
    }

    const membership = await this.workspaceMembershipReadRepository.findWorkspaceMembership(
      workspace.id,
      user.id,
    );

    if (membership === null) {
      return {
        status: 'membership_not_found',
      };
    }

    return {
      status: 'resolved',
      actor: user,
      tenant,
      workspace,
      membership,
    };
  }
}
