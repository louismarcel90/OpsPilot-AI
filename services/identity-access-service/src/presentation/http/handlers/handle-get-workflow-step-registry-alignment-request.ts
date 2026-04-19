import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowStepRegistryAlignmentUseCase } from '../../../application/use-cases/get-workflow-step-registry-alignment.use-case.js';
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

export async function handleGetWorkflowStepRegistryAlignmentRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowStepRegistryAlignmentUseCase: GetWorkflowStepRegistryAlignmentUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid workflow step registry alignment query parameters', {
      correlationId,
      operationName: 'handleGetWorkflowStepRegistryAlignmentRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/step-registry-alignment',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug" and "versionNumber" are required, and "versionNumber" must be a positive integer.',
    );
    return;
  }

  const stepRegistryAlignment = await getWorkflowStepRegistryAlignmentUseCase.execute(input);

  logger.info('Retrieved workflow step registry alignment', {
    correlationId,
    operationName: 'handleGetWorkflowStepRegistryAlignmentRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/step-registry-alignment',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly stepRegistryAlignment: typeof stepRegistryAlignment;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        stepRegistryAlignment,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
