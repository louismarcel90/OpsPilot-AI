import type { WorkspaceMembershipSummary } from '../../domain/identity/workspace-membership-summary.js';
import type { WorkspaceMembershipReadRepository } from '../repositories/workspace-membership-read-repository.js';

export interface ResolveWorkspaceMembershipInput {
  readonly workspaceId: string;
  readonly userId: string;
}

export class ResolveWorkspaceMembershipUseCase {
  public constructor(
    private readonly workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
  ) {}

  public async execute(
    input: ResolveWorkspaceMembershipInput,
  ): Promise<WorkspaceMembershipSummary | null> {
    return this.workspaceMembershipReadRepository.findWorkspaceMembership(
      input.workspaceId,
      input.userId,
    );
  }
}
