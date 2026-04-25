import type { WorkflowRuntimeProtectionDiagnostics } from '../../domain/workflows/workflow-runtime-protection-diagnostics.js';
import type { WorkflowRuntimeProtectedAction } from '../../domain/workflows/workflow-runtime-protected-action.js';
import { evaluateWorkflowRuntimeProtection } from '../../infrastructure/workflows/evaluate-workflow-runtime-protection.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';

export class GetWorkflowRuntimeProtectionDiagnosticsUseCase {
  public constructor(private readonly workflowRunReadRepository: WorkflowRunReadRepository) {}

  public async execute(input: {
    readonly workflowRunId: string;
    readonly action: WorkflowRuntimeProtectedAction;
  }): Promise<WorkflowRuntimeProtectionDiagnostics | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.workflowRunId);

    if (workflowRun === null) {
      return null;
    }

    return evaluateWorkflowRuntimeProtection({
      action: input.action,
      workflowRunId: workflowRun.id,
    });
  }
}
