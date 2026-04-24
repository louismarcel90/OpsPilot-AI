import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';

export interface ApprovalRequestReadRepository {
  findById(approvalRequestId: string): Promise<ApprovalRequest | null>;

  listByWorkflowRunId(workflowRunId: string): Promise<ApprovalRequest[]>;

  findByWorkflowRunStepId(workflowRunStepId: string): Promise<ApprovalRequest | null>;
}
