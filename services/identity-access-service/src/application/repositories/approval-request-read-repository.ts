import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';

export interface ApprovalRequestReadRepository {
  listByWorkflowRunId(workflowRunId: string): Promise<ApprovalRequest[]>;
  findByWorkflowRunStepId(workflowRunStepId: string): Promise<ApprovalRequest | null>;
}
