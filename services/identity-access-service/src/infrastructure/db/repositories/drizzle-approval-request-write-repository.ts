import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import type { PostgresConnection } from '@opspilot/db';
import { approvalRequestsTable } from '@opspilot/db';

import type { ApprovalRequestWriteRepository } from '../../../application/repositories/approval-request-write-repository.js';
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

export class DrizzleApprovalRequestWriteRepository implements ApprovalRequestWriteRepository {
  public constructor(private readonly connection: PostgresConnection) {}

  public async create(input: {
    readonly workflowRunId: string;
    readonly workflowRunStepId: string;
    readonly workspaceId: string;
  }): Promise<ApprovalRequest> {
    const approvalRequestId = randomUUID();
    const requestedAt = new Date();

    await this.connection.db.insert(approvalRequestsTable).values({
      id: approvalRequestId,
      workflowRunId: input.workflowRunId,
      workflowRunStepId: input.workflowRunStepId,
      workspaceId: input.workspaceId,
      status: 'pending',
      requestedAt,
      decidedAt: null,
    });

    return {
      id: approvalRequestId,
      workflowRunId: input.workflowRunId,
      workflowRunStepId: input.workflowRunStepId,
      workspaceId: input.workspaceId,
      status: 'pending',
      requestedAtIso: requestedAt.toISOString(),
    };
  }

  public async approve(approvalRequestId: string): Promise<ApprovalRequest | null> {
    const decidedAt = new Date();

    const rows = await this.connection.db
      .update(approvalRequestsTable)
      .set({
        status: 'approved',
        decidedAt,
      })
      .where(eq(approvalRequestsTable.id, approvalRequestId))
      .returning({
        id: approvalRequestsTable.id,
        workflowRunId: approvalRequestsTable.workflowRunId,
        workflowRunStepId: approvalRequestsTable.workflowRunStepId,
        workspaceId: approvalRequestsTable.workspaceId,
        status: approvalRequestsTable.status,
        requestedAt: approvalRequestsTable.requestedAt,
        decidedAt: approvalRequestsTable.decidedAt,
      });

    const row = rows[0];
    return row ? mapRowToApprovalRequest(row) : null;
  }

  public async reject(approvalRequestId: string): Promise<ApprovalRequest | null> {
    const decidedAt = new Date();

    const rows = await this.connection.db
      .update(approvalRequestsTable)
      .set({
        status: 'rejected',
        decidedAt,
      })
      .where(eq(approvalRequestsTable.id, approvalRequestId))
      .returning({
        id: approvalRequestsTable.id,
        workflowRunId: approvalRequestsTable.workflowRunId,
        workflowRunStepId: approvalRequestsTable.workflowRunStepId,
        workspaceId: approvalRequestsTable.workspaceId,
        status: approvalRequestsTable.status,
        requestedAt: approvalRequestsTable.requestedAt,
        decidedAt: approvalRequestsTable.decidedAt,
      });

    const row = rows[0];
    return row ? mapRowToApprovalRequest(row) : null;
  }
}
