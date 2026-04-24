import { asc, eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { approvalRequestsTable } from '@opspilot/db';

import type { ApprovalRequestReadRepository } from '../../../application/repositories/approval-request-read-repository.js';
import type { ApprovalRequest } from '../../../domain/approvals/approval-request.js';
import {
  isApprovalRequestStatus,
  type ApprovalRequestStatus,
} from '../../../domain/approvals/approval-request-status.js';

function mapApprovalRequestStatus(value: string): ApprovalRequestStatus {
  if (!isApprovalRequestStatus(value)) {
    throw new Error(`Unknown approval request status: ${value}`);
  }

  return value;
}

function mapRowToApprovalRequest(row: {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workflowRunStepId: string;
  readonly workspaceId: string;
  readonly status: string;
  readonly requestedAt: Date;
  readonly decidedAt: Date | null;
}): ApprovalRequest {
  return {
    id: row.id,
    workflowRunId: row.workflowRunId,
    workflowRunStepId: row.workflowRunStepId,
    workspaceId: row.workspaceId,
    status: mapApprovalRequestStatus(row.status),
    requestedAtIso: row.requestedAt.toISOString(),
    ...(row.decidedAt !== null ? { decidedAtIso: row.decidedAt.toISOString() } : {}),
  };
}

export class DrizzleApprovalRequestReadRepository implements ApprovalRequestReadRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async findById(approvalRequestId: string): Promise<ApprovalRequest | null> {
    const rows = await this.connection.db
      .select({
        id: approvalRequestsTable.id,
        workflowRunId: approvalRequestsTable.workflowRunId,
        workflowRunStepId: approvalRequestsTable.workflowRunStepId,
        workspaceId: approvalRequestsTable.workspaceId,
        status: approvalRequestsTable.status,
        requestedAt: approvalRequestsTable.requestedAt,
        decidedAt: approvalRequestsTable.decidedAt,
      })
      .from(approvalRequestsTable)
      .where(eq(approvalRequestsTable.id, approvalRequestId))
      .limit(1);

    const row = rows[0];
    return row ? mapRowToApprovalRequest(row) : null;
  }

  public async listByWorkflowRunId(workflowRunId: string): Promise<ApprovalRequest[]> {
    const rows = await this.connection.db
      .select({
        id: approvalRequestsTable.id,
        workflowRunId: approvalRequestsTable.workflowRunId,
        workflowRunStepId: approvalRequestsTable.workflowRunStepId,
        workspaceId: approvalRequestsTable.workspaceId,
        status: approvalRequestsTable.status,
        requestedAt: approvalRequestsTable.requestedAt,
        decidedAt: approvalRequestsTable.decidedAt,
      })
      .from(approvalRequestsTable)
      .where(eq(approvalRequestsTable.workflowRunId, workflowRunId))
      .orderBy(asc(approvalRequestsTable.requestedAt));

    return rows.map(mapRowToApprovalRequest);
  }

  public async findByWorkflowRunStepId(workflowRunStepId: string): Promise<ApprovalRequest | null> {
    const rows = await this.connection.db
      .select({
        id: approvalRequestsTable.id,
        workflowRunId: approvalRequestsTable.workflowRunId,
        workflowRunStepId: approvalRequestsTable.workflowRunStepId,
        workspaceId: approvalRequestsTable.workspaceId,
        status: approvalRequestsTable.status,
        requestedAt: approvalRequestsTable.requestedAt,
        decidedAt: approvalRequestsTable.decidedAt,
      })
      .from(approvalRequestsTable)
      .where(eq(approvalRequestsTable.workflowRunStepId, workflowRunStepId))
      .limit(1);

    const row = rows[0];
    return row ? mapRowToApprovalRequest(row) : null;
  }
}
