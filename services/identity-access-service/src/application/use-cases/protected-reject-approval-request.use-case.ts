import type { RuntimeProtectedActionGuard } from '../services/runtime-protected-action-guard.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { RejectApprovalRequestUseCase } from './reject-approval-request.use-case.js';

export class ProtectedRejectApprovalRequestUseCase {
  public constructor(
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
    private readonly rejectApprovalRequestUseCase: RejectApprovalRequestUseCase,
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
      action: 'reject_approval_request',
    });

    await this.rejectApprovalRequestUseCase.execute(input.approvalRequestId);
  }
}
