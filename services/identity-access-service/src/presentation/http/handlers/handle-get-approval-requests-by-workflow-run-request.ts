import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetApprovalRequestsByWorkflowRunUseCase } from '../../../application/use-cases/get-approval-requests-by-workflow-run.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveWorkflowRunId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const workflowRunId = url.searchParams.get('workflowRunId');

  if (!workflowRunId || workflowRunId.trim().length === 0) {
    return null;
  }

  return workflowRunId.trim();
}

export async function handleGetApprovalRequestsByWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getApprovalRequestsByWorkflowRunUseCase: GetApprovalRequestsByWorkflowRunUseCase,
): Promise<void> {
  const workflowRunId = resolveWorkflowRunId(request);

  if (workflowRunId === null) {
    logger.warn('Missing required workflowRunId query parameter', {
      correlationId,
      operationName: 'handleGetApprovalRequestsByWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/approval-requests',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "workflowRunId" is required.',
    );
    return;
  }

  const approvalRequests = await getApprovalRequestsByWorkflowRunUseCase.execute(workflowRunId);

  logger.info('Retrieved approval requests by workflow run', {
    correlationId,
    operationName: 'handleGetApprovalRequestsByWorkflowRunRequest',
    httpStatusCode: 200,
    httpPath: '/approval-requests',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly approvalRequests: typeof approvalRequests;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        approvalRequests,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
