import type { WorkflowRuntimeCommandPreview } from '../../domain/workflows/workflow-runtime-command-preview.js';
import { evaluateWorkflowEngineDiagnostics } from '../../infrastructure/workflows/evaluate-workflow-engine-diagnostics.js';
import { projectWorkflowRuntimeCommandPreview } from '../../infrastructure/workflows/project-workflow-runtime-command-preview.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

export class GetWorkflowRuntimeCommandPreviewUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRuntimeCommandPreview | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(runId);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(runId);

    const diagnostics = evaluateWorkflowEngineDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
    });

    return projectWorkflowRuntimeCommandPreview(diagnostics);
  }
}
