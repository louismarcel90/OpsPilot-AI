import type { WorkflowRuntimeDrainResult } from '../../domain/workflows/workflow-runtime-drain-result.js';
import type { RuntimeProtectedActionGuard } from '../services/runtime-protected-action-guard.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { DrainWorkflowRunUseCase } from './drain-workflow-run.use-case.js';

export class ProtectedDrainWorkflowRunUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
    private readonly drainWorkflowRunUseCase: DrainWorkflowRunUseCase,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly actorId: string;
    readonly maxCommands: number;
  }): Promise<WorkflowRuntimeDrainResult> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    await this.runtimeProtectedActionGuard.assertAllowed({
      actorId: input.actorId,
      workspaceId: workflowRun.workspaceId,
      workflowRunId: workflowRun.id,
      action: 'drain_workflow_run',
    });

    return this.drainWorkflowRunUseCase.execute({
      runId: input.runId,
      maxCommands: input.maxCommands,
    });
  }
}
