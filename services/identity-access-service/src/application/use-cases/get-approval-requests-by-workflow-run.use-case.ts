import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';

export class GetApprovalRequestsByWorkflowRunUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
  ) {}

  public async execute(workflowRunId: string): Promise<ApprovalRequest[]> {
    return this.approvalRequestReadRepository.listByWorkflowRunId(workflowRunId);
  }
}
