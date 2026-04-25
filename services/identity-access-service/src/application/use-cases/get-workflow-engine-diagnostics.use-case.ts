import type { WorkflowEngineDiagnostics } from '../../domain/workflows/workflow-engine-diagnostics.js';
import { evaluateWorkflowEngineDiagnostics } from '../../infrastructure/workflows/evaluate-workflow-engine-diagnostics.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

export class GetWorkflowEngineDiagnosticsUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowEngineDiagnostics | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(runId);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(runId);

    return evaluateWorkflowEngineDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
    });
  }
}
