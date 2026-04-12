import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetAssistantPublishReadinessUseCase } from '../../../application/use-cases/get-assistant-publish-readiness.use-case.js';
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

export async function handleGetAssistantPublishReadinessRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getAssistantPublishReadinessUseCase: GetAssistantPublishReadinessUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid publish readiness query parameters', {
      correlationId,
      operationName: 'handleGetAssistantPublishReadinessRequest',
      httpStatusCode: 400,
      httpPath: '/assistants/publish-readiness',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug" and "versionNumber" are required, and "versionNumber" must be a positive integer.',
    );
    return;
  }

  const publishReadiness = await getAssistantPublishReadinessUseCase.execute(input);

  logger.info('Retrieved assistant publish readiness', {
    correlationId,
    operationName: 'handleGetAssistantPublishReadinessRequest',
    httpStatusCode: 200,
    httpPath: '/assistants/publish-readiness',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly publishReadiness: typeof publishReadiness;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        publishReadiness,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
