import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { PublishWorkflowVersionUseCase } from '../../../application/use-cases/publish-workflow-version.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly slug: string;
  readonly versionNumber: number;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const slug = url.searchParams.get('slug');
  const versionNumberRaw = url.searchParams.get('versionNumber');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  if (!versionNumberRaw) {
    return null;
  }

  const versionNumber = Number(versionNumberRaw);

  if (!Number.isInteger(versionNumber) || versionNumber <= 0) {
    return null;
  }

  return {
    slug: slug.trim(),
    versionNumber,
  };
}

export async function handlePublishWorkflowVersionRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  publishWorkflowVersionUseCase: PublishWorkflowVersionUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid publish workflow query parameters', {
      correlationId,
      operationName: 'handlePublishWorkflowVersionRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/publish',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug" and "versionNumber" are required, and "versionNumber" must be a positive integer.',
    );
    return;
  }

  try {
    const publicationResult = await publishWorkflowVersionUseCase.execute(input);

    logger.info('Published workflow version', {
      correlationId,
      operationName: 'handlePublishWorkflowVersionRequest',
      httpStatusCode: 200,
      httpPath: '/workflows/publish',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly publicationResult: typeof publicationResult;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          publicationResult,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Workflow publication failed.';

    logger.warn('Workflow publication failed', {
      correlationId,
      operationName: 'handlePublishWorkflowVersionRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/publish',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
