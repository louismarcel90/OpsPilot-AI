import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetAssistantLatestPublicationUseCase } from '../../../application/use-cases/get-assistant-latest-publication.use-case.js';
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

export async function handleGetAssistantLatestPublicationRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getAssistantLatestPublicationUseCase: GetAssistantLatestPublicationUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetAssistantLatestPublicationRequest',
      httpStatusCode: 400,
      httpPath: '/assistants/latest-publication',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const latestPublication = await getAssistantLatestPublicationUseCase.execute(slug);

  logger.info('Retrieved assistant latest publication', {
    correlationId,
    operationName: 'handleGetAssistantLatestPublicationRequest',
    httpStatusCode: 200,
    httpPath: '/assistants/latest-publication',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly latestPublication: typeof latestPublication;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        latestPublication,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
