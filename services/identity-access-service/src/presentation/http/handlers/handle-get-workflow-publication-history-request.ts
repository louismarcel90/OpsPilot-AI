import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowPublicationHistoryUseCase } from '../../../application/use-cases/get-workflow-publication-history.use-case.js';
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

export async function handleGetWorkflowPublicationHistoryRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowPublicationHistoryUseCase: GetWorkflowPublicationHistoryUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowPublicationHistoryRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/publication-history',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const publicationHistory = await getWorkflowPublicationHistoryUseCase.execute(slug);

  logger.info('Retrieved workflow publication history', {
    correlationId,
    operationName: 'handleGetWorkflowPublicationHistoryRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/publication-history',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly publicationHistory: typeof publicationHistory;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        publicationHistory,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
