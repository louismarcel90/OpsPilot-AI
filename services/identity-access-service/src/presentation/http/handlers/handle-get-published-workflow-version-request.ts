import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetPublishedWorkflowVersionUseCase } from '../../../application/use-cases/get-published-workflow-version.use-case.js';
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

export async function handleGetPublishedWorkflowVersionRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getPublishedWorkflowVersionUseCase: GetPublishedWorkflowVersionUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetPublishedWorkflowVersionRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/published-version',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const publishedWorkflowVersion = await getPublishedWorkflowVersionUseCase.execute(slug);

  logger.info('Retrieved published workflow version', {
    correlationId,
    operationName: 'handleGetPublishedWorkflowVersionRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/published-version',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly publishedWorkflowVersion: typeof publishedWorkflowVersion;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        publishedWorkflowVersion,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
