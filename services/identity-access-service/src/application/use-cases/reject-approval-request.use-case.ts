import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import { canRejectApprovalRequest } from '../../domain/approvals/approval-request-transition.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';

export class RejectApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
  ) {}

  public async execute(approvalRequestId: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.approvalRequestReadRepository.findById(approvalRequestId);

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    if (!canRejectApprovalRequest(approvalRequest.status)) {
      throw new Error(
        `Approval request cannot transition from "${approvalRequest.status}" to "rejected".`,
      );
    }

    const rejectedRequest = await this.approvalRequestWriteRepository.reject(approvalRequestId);

    if (rejectedRequest === null) {
      throw new Error('Approval request could not be rejected.');
    }

    const failedRun = await this.workflowRunWriteRepository.failRun(approvalRequest.workflowRunId);

    if (failedRun === null) {
      throw new Error('Workflow run could not be failed after approval rejection.');
    }

    return rejectedRequest;
  }
}
