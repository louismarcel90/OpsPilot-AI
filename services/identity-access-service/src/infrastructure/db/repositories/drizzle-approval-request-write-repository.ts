import { randomUUID } from 'node:crypto';

import type { PostgresConnection } from '@opspilot/db';
import { approvalRequestsTable } from '@opspilot/db';

import type { ApprovalRequestWriteRepository } from '../../../application/repositories/approval-request-write-repository.js';
import type { ApprovalRequest } from '../../../domain/approvals/approval-request.js';

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
}
