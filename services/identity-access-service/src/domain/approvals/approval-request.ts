import type { ApprovalRequestStatus } from './approval-request-status.js';

export interface ApprovalRequest {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workflowRunStepId: string;
  readonly workspaceId: string;
  readonly status: ApprovalRequestStatus;
  readonly requestedAtIso: string;
  readonly decidedAtIso?: string;
}
