import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowBySlugUseCase } from '../../../application/use-cases/get-workflow-by-slug.use-case.js';
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

export async function handleGetWorkflowBySlugRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowBySlugUseCase: GetWorkflowBySlugUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowBySlugRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/by-slug',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const workflow = await getWorkflowBySlugUseCase.execute(slug);

  logger.info('Retrieved workflow by slug', {
    correlationId,
    operationName: 'handleGetWorkflowBySlugRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/by-slug',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly workflow: typeof workflow }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        workflow,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
