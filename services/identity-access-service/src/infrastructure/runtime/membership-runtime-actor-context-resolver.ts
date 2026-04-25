import type { RuntimeActorContextResolver } from '../../application/services/runtime-actor-context-resolver.js';
import type {
  RuntimeActorContext,
  RuntimeActorRole,
} from '../../domain/runtime/runtime-actor-context.js';
import type { WorkspaceMembershipReadRepository } from '../../application/repositories/workspace-membership-read-repository.js';

function mapMembershipRoleToRuntimeRole(role: string): RuntimeActorRole {
  if (role === 'owner' || role === 'admin') {
    return 'admin';
  }

  if (role === 'approver') {
    return 'approval_decider';
  }

  if (role === 'system') {
    return 'system';
  }

  return 'operator';
}

export class MembershipRuntimeActorContextResolver implements RuntimeActorContextResolver {
  public constructor(
    private readonly workspaceMembershipReadRepository: WorkspaceMembershipReadRepository,
  ) {}

  public async resolve(input: {
    readonly actorId: string;
    readonly workspaceId: string;
  }): Promise<RuntimeActorContext | null> {
    if (input.actorId === 'system') {
      return {
        actorId: input.actorId,
        workspaceId: input.workspaceId,
        actorKind: 'system',
        role: 'system',
      };
    }

    const membership = await this.workspaceMembershipReadRepository.findWorkspaceMembership(
      input.workspaceId,
      input.actorId,
    );

    if (membership === null) {
      return null;
    }

    return {
      actorId: input.actorId,
      workspaceId: input.workspaceId,
      actorKind: 'human',
      role: mapMembershipRoleToRuntimeRole(membership.roleCode),
    };
  }
}
