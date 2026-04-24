import type { WorkflowRunOperationalView } from '../../domain/workflows/workflow-run-operational-view.js';
import { projectWorkflowRunOperationalView } from '../../infrastructure/workflows/project-workflow-run-operational-view.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

export class GetWorkflowRunOperationalViewUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRunOperationalView | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(runId);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(runId);

    return projectWorkflowRunOperationalView({
      workflowRun,
      runSteps,
      approvalRequests,
    });
  }
}
