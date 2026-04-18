import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowVersionStepsUseCase } from '../../../application/use-cases/get-workflow-version-steps.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveWorkflowVersionId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const workflowVersionId = url.searchParams.get('workflowVersionId');

  if (!workflowVersionId || workflowVersionId.trim().length === 0) {
    return null;
  }

  return workflowVersionId.trim();
}

export async function handleGetWorkflowVersionStepsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowVersionStepsUseCase: GetWorkflowVersionStepsUseCase,
): Promise<void> {
  const workflowVersionId = resolveWorkflowVersionId(request);

  if (workflowVersionId === null) {
    logger.warn('Missing required workflowVersionId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowVersionStepsRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/version-steps',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "workflowVersionId" is required.',
    );
    return;
  }

  const steps = await getWorkflowVersionStepsUseCase.execute(workflowVersionId);

  logger.info('Retrieved workflow version steps', {
    correlationId,
    operationName: 'handleGetWorkflowVersionStepsRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/version-steps',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly steps: typeof steps }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        steps,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
