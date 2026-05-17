import type { RuntimeProtectedActionGuard } from '../services/runtime-protected-action-guard.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { ApproveApprovalRequestUseCase } from './approve-approval-request.use-case.js';

export class ProtectedApproveApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
    private readonly approveApprovalRequestUseCase: ApproveApprovalRequestUseCase,
  ) {}

  public async execute(input: {
    readonly approvalRequestId: string;
    readonly actorId: string;
  }): Promise<void> {
    const approvalRequest = await this.approvalRequestReadRepository.findById(
      input.approvalRequestId,
    );

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    await this.runtimeProtectedActionGuard.assertAllowed({
      actorId: input.actorId,
      workspaceId: approvalRequest.workspaceId,
      workflowRunId: approvalRequest.workflowRunId,
      action: 'approve_approval_request',
    });

    await this.approveApprovalRequestUseCase.execute(input.approvalRequestId);
  }
}
