import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import { canRejectApprovalRequest } from '../../domain/approvals/approval-request-transition.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';

export class RejectApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(approvalRequestId: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.approvalRequestReadRepository.findById(approvalRequestId);

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    if (!canRejectApprovalRequest(approvalRequest.status)) {
      throw new Error(
        `Approval request cannot transition from "${approvalRequest.status}" to "rejected".`,
      );
    }

    const rejectedRequest = await this.approvalRequestWriteRepository.reject(approvalRequestId);

    if (rejectedRequest === null) {
      throw new Error('Approval request could not be rejected.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: rejectedRequest.workflowRunId,
      workspaceId: rejectedRequest.workspaceId,
      eventType: 'approval_request_rejected',
      payload: {
        approvalRequestId: rejectedRequest.id,
        workflowRunId: rejectedRequest.workflowRunId,
        workflowRunStepId: rejectedRequest.workflowRunStepId,
        previousStatus: approvalRequest.status,
        status: rejectedRequest.status,
        decidedAtIso: rejectedRequest.decidedAtIso ?? null,
      },
    });

    const failedRun = await this.workflowRunWriteRepository.failRun(approvalRequest.workflowRunId);

    if (failedRun === null) {
      throw new Error('Workflow run could not be failed after approval rejection.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: failedRun.id,
      workspaceId: failedRun.workspaceId,
      eventType: 'workflow_run_failed',
      payload: {
        workflowRunId: failedRun.id,
        status: failedRun.status,
        completedAtIso: failedRun.completedAtIso ?? null,
        rejectedApprovalRequestId: rejectedRequest.id,
      },
    });

    return rejectedRequest;
  }
}
