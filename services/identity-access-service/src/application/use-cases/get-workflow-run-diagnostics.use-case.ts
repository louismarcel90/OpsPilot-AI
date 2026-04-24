import {
  buildWorkflowRunDiagnostics,
  type WorkflowRunDiagnostics,
} from '../../domain/workflows/workflow-run-diagnostics.js';
import { checkWorkflowRunInvariants } from '../../domain/workflows/workflow-run-invariants.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

export class GetWorkflowRunDiagnosticsUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRunDiagnostics | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(runId);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(runId);

    const violations = checkWorkflowRunInvariants({
      workflowRun,
      runSteps,
      approvalRequests,
    });

    return buildWorkflowRunDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
      violations,
    });
  }
}
