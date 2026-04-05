import type { WorkspaceScope } from '../../domain/authorization/workspace-scope-catalog.js';
import type { ProtectedRouteDecision } from '../../domain/authorization/protected-route-decision.js';
import type { RequestActorContextHeaders } from '../../domain/identity/request-actor-context-headers.js';
import type { CheckWorkspaceCapabilityUseCase } from './check-workspace-capability.use-case.js';

export interface EnforceProtectedWorkspaceScopeInput {
  readonly headers: RequestActorContextHeaders | null;
  readonly requiredScope: WorkspaceScope;
}

export class EnforceProtectedWorkspaceScopeUseCase {
  public constructor(
    private readonly checkWorkspaceCapabilityUseCase: CheckWorkspaceCapabilityUseCase,
  ) {}

  public async execute(
    input: EnforceProtectedWorkspaceScopeInput,
  ): Promise<ProtectedRouteDecision> {
    if (input.headers === null) {
      return {
        status: 'denied_missing_headers',
        message: 'Headers "x-actor-email", "x-tenant-slug", and "x-workspace-slug" are required.',
      };
    }

    const capabilityDecision = await this.checkWorkspaceCapabilityUseCase.execute({
      email: input.headers.actorEmail,
      tenantSlug: input.headers.tenantSlug,
      workspaceSlug: input.headers.workspaceSlug,
      requiredScope: input.requiredScope,
    });

    switch (capabilityDecision.status) {
      case 'allowed':
        return {
          status: 'allowed',
          capabilityDecision,
        };
      case 'denied_user_not_found':
        return {
          status: 'denied_user_not_found',
          message: 'The actor could not be resolved from the provided headers.',
        };
      case 'denied_tenant_not_found':
        return {
          status: 'denied_tenant_not_found',
          message: 'The tenant could not be resolved from the provided headers.',
        };
      case 'denied_workspace_not_found':
        return {
          status: 'denied_workspace_not_found',
          message: 'The workspace could not be resolved from the provided headers.',
        };
      case 'denied_membership_not_found':
        return {
          status: 'denied_membership_not_found',
          message: 'The actor does not belong to the target workspace.',
        };
      case 'denied_invalid_role':
        return {
          status: 'denied_invalid_role',
          message: 'The workspace membership contains an invalid role.',
        };
      case 'denied_missing_scope':
        return {
          status: 'denied_missing_scope',
          message: 'The actor does not have the required workspace capability.',
        };
    }
  }
}
