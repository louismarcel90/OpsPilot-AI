import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowVersionsUseCase } from '../../../application/use-cases/get-workflow-versions.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveWorkflowTemplateId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const workflowTemplateId = url.searchParams.get('workflowTemplateId');

  if (!workflowTemplateId || workflowTemplateId.trim().length === 0) {
    return null;
  }

  return workflowTemplateId.trim();
}

export async function handleGetWorkflowVersionsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowVersionsUseCase: GetWorkflowVersionsUseCase,
): Promise<void> {
  const workflowTemplateId = resolveWorkflowTemplateId(request);

  if (workflowTemplateId === null) {
    logger.warn('Missing required workflowTemplateId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowVersionsRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/versions',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "workflowTemplateId" is required.',
    );
    return;
  }

  const versions = await getWorkflowVersionsUseCase.execute(workflowTemplateId);

  logger.info('Retrieved workflow versions', {
    correlationId,
    operationName: 'handleGetWorkflowVersionsRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/versions',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly versions: typeof versions }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        versions,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
