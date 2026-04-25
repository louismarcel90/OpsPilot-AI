import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ApproveApprovalRequestUseCase } from '../../../application/use-cases/approve-approval-request.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import type { ApprovalRequestReadRepository } from '../../../application/repositories/approval-request-read-repository.js';
import type { RuntimeProtectedActionGuard } from '../../../application/services/runtime-protected-action-guard.js';
import { resolveRuntimeActorId } from './resolve-runtime-actor-id.js';

function resolveApprovalRequestId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const approvalRequestId = url.searchParams.get('approvalRequestId');

  if (!approvalRequestId || approvalRequestId.trim().length === 0) {
    return null;
  }

  return approvalRequestId.trim();
}

export async function handleApproveApprovalRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  approveApprovalRequestUseCase: ApproveApprovalRequestUseCase,
  approvalRequestReadRepository: ApprovalRequestReadRepository,
  runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
): Promise<void> {
  const approvalRequestId = resolveApprovalRequestId(request);
  const actorId = resolveRuntimeActorId(request);

  if (approvalRequestId === null || actorId === null) {
    logger.warn('Missing required query parameters', {
      correlationId,
      operationName: 'handleApproveApprovalRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests/approve',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "approvalRequestId" and "actorId" are required.',
    );
    return;
  }

  try {
    const approvalRequest = await approveApprovalRequestUseCase.execute(approvalRequestId);

    if (approvalRequest === null) {
      throw new Error('Approval request was not found.');
    }

    await runtimeProtectedActionGuard.assertAllowed({
      actorId,
      workspaceId: approvalRequest.workspaceId,
      workflowRunId: approvalRequest.workflowRunId,
      action: 'approve_approval_request',
    });

    logger.info('Approved approval request', {
      correlationId,
      operationName: 'handleApproveApprovalRequest',
      httpStatusCode: 200,
      httpPath: '/approval-requests/approve',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly approvalRequest: typeof approvalRequest;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          approvalRequest,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Approval request approval failed.';

    logger.warn('Approval request approval failed', {
      correlationId,
      operationName: 'handleApproveApprovalRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests/approve',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
