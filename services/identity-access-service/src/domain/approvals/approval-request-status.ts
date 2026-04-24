export const APPROVAL_REQUEST_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

export type ApprovalRequestStatus = (typeof APPROVAL_REQUEST_STATUS_VALUES)[number];

export function isApprovalRequestStatus(value: string): value is ApprovalRequestStatus {
  return APPROVAL_REQUEST_STATUS_VALUES.includes(value as ApprovalRequestStatus);
}
