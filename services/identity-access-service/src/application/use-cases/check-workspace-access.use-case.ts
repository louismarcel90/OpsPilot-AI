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
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'USER_NOT_FOUND',
            reasonMessage: 'The user could not be found.',
            requiredRole: input.requiredRole,
          },
        };

      case 'tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          requiredRole: input.requiredRole,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'TENANT_NOT_FOUND',
            reasonMessage: 'The tenant could not be found.',
            requiredRole: input.requiredRole,
          },
        };

      case 'workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          requiredRole: input.requiredRole,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'WORKSPACE_NOT_FOUND',
            reasonMessage: 'The workspace could not be found.',
            requiredRole: input.requiredRole,
          },
        };

      case 'membership_not_found':
        return {
          status: 'denied_membership_not_found',
          requiredRole: input.requiredRole,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'MEMBERSHIP_NOT_FOUND',
            reasonMessage: 'No workspace membership was found for this user.',
            requiredRole: input.requiredRole,
          },
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
        diagnostic: {
          reasonCode: 'INVALID_ROLE_CODE',
          reasonMessage: 'The membership role is not a valid workspace role code.',
          requiredRole: input.requiredRole,
          actualRole: membershipRole,
        },
      };
    }

    if (!hasAtLeastRequiredRole(membershipRole, input.requiredRole)) {
      return {
        status: 'denied_insufficient_role',
        requiredRole: input.requiredRole,
        actualRole: membershipRole,
        diagnostic: {
          reasonCode: 'INSUFFICIENT_ROLE',
          reasonMessage: 'The membership role does not satisfy the required workspace role.',
          requiredRole: input.requiredRole,
          actualRole: membershipRole,
        },
      };
    }

    return {
      status: 'allowed',
      accessContext,
      actualRole: membershipRole,
      requiredRole: input.requiredRole,
      diagnostic: {
        reasonCode: 'ACCESS_GRANTED',
        reasonMessage: 'Workspace access granted.',
        requiredRole: input.requiredRole,
        actualRole: membershipRole,
      },
    };
  }
}
