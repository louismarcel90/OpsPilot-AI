import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetAssistantBySlugUseCase } from '../../../application/use-cases/get-assistant-by-slug.use-case.js';
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

export async function handleGetAssistantBySlugRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getAssistantBySlugUseCase: GetAssistantBySlugUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetAssistantBySlugRequest',
      httpStatusCode: 400,
      httpPath: '/assistants/by-slug',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const assistant = await getAssistantBySlugUseCase.execute(slug);

  logger.info('Retrieved assistant by slug', {
    correlationId,
    operationName: 'handleGetAssistantBySlugRequest',
    httpStatusCode: 200,
    httpPath: '/assistants/by-slug',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly assistant: typeof assistant }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        assistant,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
