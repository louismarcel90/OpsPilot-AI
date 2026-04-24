import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';

export interface ApprovalRequestWriteRepository {
  create(input: {
    readonly workflowRunId: string;
    readonly workflowRunStepId: string;
    readonly workspaceId: string;
  }): Promise<ApprovalRequest>;

  approve(approvalRequestId: string): Promise<ApprovalRequest | null>;

  reject(approvalRequestId: string): Promise<ApprovalRequest | null>;
}
