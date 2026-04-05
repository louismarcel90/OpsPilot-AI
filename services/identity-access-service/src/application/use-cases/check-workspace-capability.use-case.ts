import {
  getWorkspaceRoleScopes,
  hasWorkspaceScope,
} from '../../domain/authorization/workspace-scope-mapping.js';
import { isWorkspaceRoleCode } from '../../domain/authorization/role-catalog.js';
import type { WorkspaceScope } from '../../domain/authorization/workspace-scope-catalog.js';
import type { WorkspaceCapabilityDecision } from '../../domain/authorization/workspace-capability-decision.js';
import type {
  ResolveAccessContextInput,
  ResolveAccessContextUseCase,
} from './resolve-access-context.use-case.js';

export interface CheckWorkspaceCapabilityInput extends ResolveAccessContextInput {
  readonly requiredScope: WorkspaceScope;
}

export class CheckWorkspaceCapabilityUseCase {
  public constructor(private readonly resolveAccessContextUseCase: ResolveAccessContextUseCase) {}

  public async execute(input: CheckWorkspaceCapabilityInput): Promise<WorkspaceCapabilityDecision> {
    const accessContext = await this.resolveAccessContextUseCase.execute({
      email: input.email,
      tenantSlug: input.tenantSlug,
      workspaceSlug: input.workspaceSlug,
    });

    switch (accessContext.status) {
      case 'user_not_found':
        return {
          status: 'denied_user_not_found',
          requiredScope: input.requiredScope,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'USER_NOT_FOUND',
            reasonMessage: 'The user could not be found.',
            requiredScope: input.requiredScope,
          },
        };

      case 'tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          requiredScope: input.requiredScope,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'TENANT_NOT_FOUND',
            reasonMessage: 'The tenant could not be found.',
            requiredScope: input.requiredScope,
          },
        };

      case 'workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          requiredScope: input.requiredScope,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'WORKSPACE_NOT_FOUND',
            reasonMessage: 'The workspace could not be found.',
            requiredScope: input.requiredScope,
          },
        };

      case 'membership_not_found':
        return {
          status: 'denied_membership_not_found',
          requiredScope: input.requiredScope,
          actualRole: 'unknown',
          diagnostic: {
            reasonCode: 'MEMBERSHIP_NOT_FOUND',
            reasonMessage: 'No workspace membership was found for this user.',
            requiredScope: input.requiredScope,
          },
        };

      case 'resolved':
        break;
    }

    const membershipRole = accessContext.membership.roleCode;

    if (!isWorkspaceRoleCode(membershipRole)) {
      return {
        status: 'denied_invalid_role',
        requiredScope: input.requiredScope,
        actualRole: membershipRole,
        diagnostic: {
          reasonCode: 'INVALID_ROLE_CODE',
          reasonMessage: 'The membership role is not a valid workspace role code.',
          requiredScope: input.requiredScope,
          actualRole: membershipRole,
        },
      };
    }

    const grantedScopes = getWorkspaceRoleScopes(membershipRole);

    if (!hasWorkspaceScope(membershipRole, input.requiredScope)) {
      return {
        status: 'denied_missing_scope',
        requiredScope: input.requiredScope,
        actualRole: membershipRole,
        grantedScopes,
        diagnostic: {
          reasonCode: 'MISSING_REQUIRED_SCOPE',
          reasonMessage: 'The membership role does not grant the required workspace scope.',
          requiredScope: input.requiredScope,
          actualRole: membershipRole,
          grantedScopes,
        },
      };
    }

    return {
      status: 'allowed',
      accessContext,
      actualRole: membershipRole,
      grantedScopes,
      requiredScope: input.requiredScope,
      diagnostic: {
        reasonCode: 'ACCESS_GRANTED',
        reasonMessage: 'Workspace capability granted.',
        requiredScope: input.requiredScope,
        actualRole: membershipRole,
        grantedScopes,
      },
    };
  }
}
