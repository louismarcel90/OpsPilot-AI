import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetAssistantVersionConsistencyUseCase } from '../../../application/use-cases/get-assistant-version-consistency.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveSlug(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const slug = url.searchParams.get('slug');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  return slug.trim();
}

export async function handleGetAssistantVersionConsistencyRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getAssistantVersionConsistencyUseCase: GetAssistantVersionConsistencyUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetAssistantVersionConsistencyRequest',
      httpStatusCode: 400,
      httpPath: '/assistants/version-consistency',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const consistencyCheck = await getAssistantVersionConsistencyUseCase.execute(slug);

  logger.info('Retrieved assistant version consistency', {
    correlationId,
    operationName: 'handleGetAssistantVersionConsistencyRequest',
    httpStatusCode: 200,
    httpPath: '/assistants/version-consistency',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly consistencyCheck: typeof consistencyCheck;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        consistencyCheck,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
