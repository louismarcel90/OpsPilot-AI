import type { WorkspaceCapabilityDecision } from '../../domain/authorization/workspace-capability-decision.js';
import type { WorkspaceScope } from '../../domain/authorization/workspace-scope-catalog.js';
import type { ProtectedWorkspaceRequest } from '../../domain/request/protected-workspace-request.js';
import type { CheckWorkspaceCapabilityUseCase } from './check-workspace-capability.use-case.js';

export interface ProtectedWorkspaceEnforcementResult {
  readonly decision: WorkspaceCapabilityDecision;
}

export class EnforceProtectedWorkspaceRequestUseCase {
  public constructor(
    private readonly checkWorkspaceCapabilityUseCase: CheckWorkspaceCapabilityUseCase,
  ) {}

  public async execute(
    request: ProtectedWorkspaceRequest,
    requiredScope: WorkspaceScope,
  ): Promise<ProtectedWorkspaceEnforcementResult> {
    const decision = await this.checkWorkspaceCapabilityUseCase.execute({
      email: request.actorEmail,
      tenantSlug: request.tenantSlug,
      workspaceSlug: request.workspaceSlug,
      requiredScope,
    });

    return {
      decision,
    };
  }
}
