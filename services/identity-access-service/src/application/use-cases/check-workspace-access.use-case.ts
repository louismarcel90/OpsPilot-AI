import { hasAtLeastRequiredRole } from '../../domain/authorization/role-rank.js';
import {
  isWorkspaceRoleCode,
  type WorkspaceRoleCode,
} from '../../domain/authorization/role-catalog.js';
import type { WorkspaceAccessDecision } from '../../domain/authorization/workspace-access-decision.js';
import type {
  ResolveAccessContextUseCase,
  ResolveAccessContextInput,
} from './resolve-access-context.use-case.js';

export interface CheckWorkspaceAccessInput extends ResolveAccessContextInput {
  readonly requiredRole: WorkspaceRoleCode;
}

export class CheckWorkspaceAccessUseCase {
  public constructor(private readonly resolveAccessContextUseCase: ResolveAccessContextUseCase) {}

  public async execute(input: CheckWorkspaceAccessInput): Promise<WorkspaceAccessDecision> {
    const accessContext = await this.resolveAccessContextUseCase.execute({
      email: input.email,
      tenantSlug: input.tenantSlug,
      workspaceSlug: input.workspaceSlug,
    });

    switch (accessContext.status) {
      case 'user_not_found':
        return {
          status: 'denied_user_not_found',
          requiredRole: input.requiredRole,
        };
      case 'tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          requiredRole: input.requiredRole,
        };
      case 'workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          requiredRole: input.requiredRole,
        };
      case 'membership_not_found':
        return {
          status: 'denied_membership_not_found',
          requiredRole: input.requiredRole,
        };
      case 'resolved':
        break;
    }

    const membershipRole = accessContext.membership.roleCode;

    if (!isWorkspaceRoleCode(membershipRole)) {
      return {
        status: 'denied_invalid_role',
        requiredRole: input.requiredRole,
        actualRole: membershipRole,
      };
    }

    if (!hasAtLeastRequiredRole(membershipRole, input.requiredRole)) {
      return {
        status: 'denied_insufficient_role',
        requiredRole: input.requiredRole,
        actualRole: membershipRole,
      };
    }

    return {
      status: 'allowed',
      accessContext,
      actualRole: membershipRole,
      requiredRole: input.requiredRole,
    };
  }
}
