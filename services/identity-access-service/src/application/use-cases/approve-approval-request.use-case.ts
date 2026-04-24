import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import { canApproveApprovalRequest } from '../../domain/approvals/approval-request-transition.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';

export class ApproveApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
  ) {}

  public async execute(approvalRequestId: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.approvalRequestReadRepository.findById(approvalRequestId);

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    if (!canApproveApprovalRequest(approvalRequest.status)) {
      throw new Error(
        `Approval request cannot transition from "${approvalRequest.status}" to "approved".`,
      );
    }

    const approvedRequest = await this.approvalRequestWriteRepository.approve(approvalRequestId);

    if (approvedRequest === null) {
      throw new Error('Approval request could not be approved.');
    }

    const unblockedRunStep = await this.workflowRunStepWriteRepository.markRunStepReady(
      approvalRequest.workflowRunStepId,
    );

    if (unblockedRunStep === null) {
      throw new Error('Approved workflow run step could not be unblocked.');
    }

    return approvedRequest;
  }
}
