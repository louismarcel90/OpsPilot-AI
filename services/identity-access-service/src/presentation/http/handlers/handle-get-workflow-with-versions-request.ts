import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowWithVersionsUseCase } from '../../../application/use-cases/get-workflow-with-versions.use-case.js';
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

export async function handleGetWorkflowWithVersionsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowWithVersionsUseCase: GetWorkflowWithVersionsUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required slug query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowWithVersionsRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/with-versions',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const workflowWithVersions = await getWorkflowWithVersionsUseCase.execute(slug);

  logger.info('Retrieved workflow with versions', {
    correlationId,
    operationName: 'handleGetWorkflowWithVersionsRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/with-versions',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly workflowWithVersions: typeof workflowWithVersions;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        workflowWithVersions,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
