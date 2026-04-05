import { hasWorkspaceScope } from '../../domain/authorization/workspace-scope-mapping.js';
import type { WorkspaceCapabilityDecision } from '../../domain/authorization/workspace-capability-decision.js';
import type { WorkspaceRoleCode } from '../../domain/authorization/role-catalog.js';
import type { WorkspaceScope } from '../../domain/authorization/workspace-scope-catalog.js';
import {
  createAllowedAuthorizationDiagnostic,
  createDeniedAuthorizationDiagnostic,
  resolveRoleCapabilities,
} from '../../domain/authorization/authorization-helpers.js';
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
          diagnostic: createDeniedAuthorizationDiagnostic(
            'USER_NOT_FOUND',
            'No actor could be resolved for the supplied email.',
            {
              requiredScope: input.requiredScope,
            },
          ),
        };

      case 'tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          requiredScope: input.requiredScope,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'TENANT_NOT_FOUND',
            'No tenant could be resolved for the supplied tenant slug.',
            {
              requiredScope: input.requiredScope,
            },
          ),
        };

      case 'workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          requiredScope: input.requiredScope,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'WORKSPACE_NOT_FOUND',
            'No workspace could be resolved for the supplied tenant and workspace slugs.',
            {
              requiredScope: input.requiredScope,
            },
          ),
        };

      case 'membership_not_found':
        return {
          status: 'denied_membership_not_found',
          requiredScope: input.requiredScope,
          diagnostic: createDeniedAuthorizationDiagnostic(
            'MEMBERSHIP_NOT_FOUND',
            'The actor does not have a membership in the target workspace.',
            {
              requiredScope: input.requiredScope,
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
        requiredScope: input.requiredScope,
        actualRole: resolvedRole.actualRole,
        diagnostic: createDeniedAuthorizationDiagnostic(
          'INVALID_ROLE_CODE',
          'The membership contains a role code that is not recognized by the role catalog.',
          {
            requiredScope: input.requiredScope,
            actualRole: resolvedRole.actualRole,
            grantedScopes: resolvedRole.grantedScopes,
          },
        ),
      };
    }

    const actualRole = resolvedRole.actualRole as WorkspaceRoleCode;

    if (!hasWorkspaceScope(actualRole, input.requiredScope)) {
      return {
        status: 'denied_missing_scope',
        requiredScope: input.requiredScope,
        actualRole,
        grantedScopes: resolvedRole.grantedScopes,
        diagnostic: createDeniedAuthorizationDiagnostic(
          'MISSING_REQUIRED_SCOPE',
          'The actor role does not grant the required workspace scope.',
          {
            requiredScope: input.requiredScope,
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
      grantedScopes: resolvedRole.grantedScopes,
      requiredScope: input.requiredScope,
      diagnostic: createAllowedAuthorizationDiagnostic(
        actualRole,
        resolvedRole.grantedScopes,
        input.requiredScope,
        undefined,
      ),
    };
  }
}
