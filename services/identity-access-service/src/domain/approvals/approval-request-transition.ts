import type { ApprovalRequestStatus } from './approval-request-status.js';

export function canApproveApprovalRequest(status: ApprovalRequestStatus): boolean {
  return status === 'pending';
}

export function canRejectApprovalRequest(status: ApprovalRequestStatus): boolean {
  return status === 'pending';
}
