import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ApproveApprovalRequestUseCase } from '../../../application/use-cases/approve-approval-request.use-case.js';
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

export async function handleApproveApprovalRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  approveApprovalRequestUseCase: ApproveApprovalRequestUseCase,
): Promise<void> {
  const approvalRequestId = resolveApprovalRequestId(request);

  if (approvalRequestId === null) {
    logger.warn('Missing required approvalRequestId query parameter', {
      correlationId,
      operationName: 'handleApproveApprovalRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests/approve',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "approvalRequestId" is required.',
    );
    return;
  }

  try {
    const approvalRequest = await approveApprovalRequestUseCase.execute(approvalRequestId);

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
