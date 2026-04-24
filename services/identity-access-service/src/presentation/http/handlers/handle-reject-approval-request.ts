import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { RejectApprovalRequestUseCase } from '../../../application/use-cases/reject-approval-request.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveApprovalRequestId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const approvalRequestId = url.searchParams.get('approvalRequestId');

  if (!approvalRequestId || approvalRequestId.trim().length === 0) {
    return null;
  }

  return approvalRequestId.trim();
}

export async function handleRejectApprovalRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  rejectApprovalRequestUseCase: RejectApprovalRequestUseCase,
): Promise<void> {
  const approvalRequestId = resolveApprovalRequestId(request);

  if (approvalRequestId === null) {
    logger.warn('Missing required approvalRequestId query parameter', {
      correlationId,
      operationName: 'handleRejectApprovalRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests/reject',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "approvalRequestId" is required.',
    );
    return;
  }

  try {
    const approvalRequest = await rejectApprovalRequestUseCase.execute(approvalRequestId);

    logger.info('Rejected approval request', {
      correlationId,
      operationName: 'handleRejectApprovalRequest',
      httpStatusCode: 200,
      httpPath: '/approval-requests/reject',
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
      error instanceof Error ? error.message : 'Approval request rejection failed.';

    logger.warn('Approval request rejection failed', {
      correlationId,
      operationName: 'handleRejectApprovalRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests/reject',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
