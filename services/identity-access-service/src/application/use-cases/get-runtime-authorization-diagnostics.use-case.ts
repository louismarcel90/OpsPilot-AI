import type { RuntimeAuthorizationDecision } from '../../domain/runtime/runtime-authorization-decision.js';
import type { WorkflowRuntimeProtectedAction } from '../../domain/workflows/workflow-runtime-protected-action.js';
import type { RuntimeProtectedActionGuard } from '../services/runtime-protected-action-guard.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';

export class GetRuntimeAuthorizationDiagnosticsUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
  ) {}

  public async execute(input: {
    readonly actorId: string;
    readonly workflowRunId: string;
    readonly action: WorkflowRuntimeProtectedAction;
  }): Promise<RuntimeAuthorizationDecision | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.workflowRunId);

    if (workflowRun === null) {
      return null;
    }

    return this.runtimeProtectedActionGuard.evaluate({
      actorId: input.actorId,
      workspaceId: workflowRun.workspaceId,
      workflowRunId: workflowRun.id,
      action: input.action,
    });
  }
}
