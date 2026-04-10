import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetAssistantVersionsUseCase } from '../../../application/use-cases/get-assistant-versions.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveAssistantId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const assistantId = url.searchParams.get('assistantId');

  if (!assistantId || assistantId.trim().length === 0) {
    return null;
  }

  return assistantId.trim();
}

export async function handleGetAssistantVersionsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getAssistantVersionsUseCase: GetAssistantVersionsUseCase,
): Promise<void> {
  const assistantId = resolveAssistantId(request);

  if (assistantId === null) {
    logger.warn('Missing required assistantId query parameter', {
      correlationId,
      operationName: 'handleGetAssistantVersionsRequest',
      httpStatusCode: 400,
      httpPath: '/assistants/versions',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "assistantId" is required.');
    return;
  }

  const versions = await getAssistantVersionsUseCase.execute(assistantId);

  logger.info('Retrieved assistant versions', {
    correlationId,
    operationName: 'handleGetAssistantVersionsRequest',
    httpStatusCode: 200,
    httpPath: '/assistants/versions',
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
