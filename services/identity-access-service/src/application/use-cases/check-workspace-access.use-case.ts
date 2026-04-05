import { hasAtLeastRequiredRole } from '../../domain/authorization/role-rank.js';
import type { WorkspaceAccessDecision } from '../../domain/authorization/workspace-access-decision.js';
import type { WorkspaceRoleCode } from '../../domain/authorization/role-catalog.js';
import {
  createAllowedAuthorizationDiagnostic,
  createDeniedAuthorizationDiagnostic,
  resolveRoleCapabilities,
} from '../../domain/authorization/authorization-helpers.js';
import type {
  ResolveAccessContextInput,
  ResolveAccessContextUseCase,
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
          diagnostic: createDeniedAuthorizationDiagnostic(
            'USER_NOT_FOUND',
            'No actor could be resolved for the supplied email.',
            {
              requiredRole: input.requiredRole,
            },
          ),
        };

      case 'tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          requiredRole: input.requiredRole,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'TENANT_NOT_FOUND',
            'No tenant could be resolved for the supplied tenant slug.',
            {
              requiredRole: input.requiredRole,
            },
          ),
        };

      case 'workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          requiredRole: input.requiredRole,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'WORKSPACE_NOT_FOUND',
            'No workspace could be resolved for the supplied tenant and workspace slugs.',
            {
              requiredRole: input.requiredRole,
            },
          ),
        };

      case 'membership_not_found':
        return {
          status: 'denied_membership_not_found',
          requiredRole: input.requiredRole,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'MEMBERSHIP_NOT_FOUND',
            'The actor does not have a membership in the target workspace.',
            {
              requiredRole: input.requiredRole,
            },
          ),
        };

      case 'resolved':
        break;
    }

    const resolvedRole = resolveRoleCapabilities(accessContext.membership.roleCode);

    if (!resolvedRole.isValid) {
      return {
        status: 'denied_invalid_role',
        requiredRole: input.requiredRole,
        actualRole: resolvedRole.actualRole,
        diagnostic: createDeniedAuthorizationDiagnostic(
          'INVALID_ROLE_CODE',
          'The membership contains a role code that is not recognized by the role catalog.',
          {
            requiredRole: input.requiredRole,
            actualRole: resolvedRole.actualRole,
            grantedScopes: resolvedRole.grantedScopes,
          },
        ),
      };
    }

    const actualRole = resolvedRole.actualRole as WorkspaceRoleCode;

    if (!hasAtLeastRequiredRole(actualRole, input.requiredRole)) {
      return {
        status: 'denied_insufficient_role',
        requiredRole: input.requiredRole,
        actualRole,
        diagnostic: createDeniedAuthorizationDiagnostic(
          'INSUFFICIENT_ROLE',
          'The actor role does not satisfy the minimum required role level.',
          {
            requiredRole: input.requiredRole,
            actualRole,
            grantedScopes: resolvedRole.grantedScopes,
          },
        ),
      };
    }

    return {
      status: 'allowed',
      accessContext,
      actualRole,
      requiredRole: input.requiredRole,
      diagnostic: createAllowedAuthorizationDiagnostic(
        actualRole,
        resolvedRole.grantedScopes,
        undefined,
        input.requiredRole,
      ),
    };
  }
}
