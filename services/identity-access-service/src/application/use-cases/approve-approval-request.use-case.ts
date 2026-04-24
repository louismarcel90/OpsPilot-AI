import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import { canApproveApprovalRequest } from '../../domain/approvals/approval-request-transition.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';

export class ApproveApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(approvalRequestId: string): Promise<ApprovalRequest> {
    const approvalRequest = await this.approvalRequestReadRepository.findById(approvalRequestId);

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    if (!canApproveApprovalRequest(approvalRequest.status)) {
      throw new Error(
        `Approval request cannot transition from "${approvalRequest.status}" to "approved".`,
      );
    }

    const approvedRequest = await this.approvalRequestWriteRepository.approve(approvalRequestId);

    if (approvedRequest === null) {
      throw new Error('Approval request could not be approved.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: approvedRequest.workflowRunId,
      workspaceId: approvedRequest.workspaceId,
      eventType: 'approval_request_approved',
      payload: {
        approvalRequestId: approvedRequest.id,
        workflowRunId: approvedRequest.workflowRunId,
        workflowRunStepId: approvedRequest.workflowRunStepId,
        previousStatus: approvalRequest.status,
        status: approvedRequest.status,
        decidedAtIso: approvedRequest.decidedAtIso ?? null,
      },
    });

    const unblockedRunStep = await this.workflowRunStepWriteRepository.markRunStepReady(
      approvalRequest.workflowRunStepId,
    );

    if (unblockedRunStep === null) {
      throw new Error('Approved workflow run step could not be unblocked.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: unblockedRunStep.workflowRunId,
      workspaceId: approvedRequest.workspaceId,
      eventType: 'workflow_run_step_ready',
      payload: {
        workflowRunId: unblockedRunStep.workflowRunId,
        workflowRunStepId: unblockedRunStep.id,
        workflowStepDefinitionId: unblockedRunStep.workflowStepDefinitionId,
        sequenceNumber: unblockedRunStep.sequenceNumber,
        status: unblockedRunStep.status,
        approvalRequestId: approvedRequest.id,
      },
    });

    return approvedRequest;
  }
}
