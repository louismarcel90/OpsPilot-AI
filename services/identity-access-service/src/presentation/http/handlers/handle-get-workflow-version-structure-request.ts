import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowVersionStructureUseCase } from '../../../application/use-cases/get-workflow-version-structure.use-case.js';
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

export async function handleGetWorkflowVersionStructureRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowVersionStructureUseCase: GetWorkflowVersionStructureUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid workflow version structure query parameters', {
      correlationId,
      operationName: 'handleGetWorkflowVersionStructureRequest',
      httpStatusCode: 400,
      httpPath: '/workflows/version-structure',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug" and "versionNumber" are required, and "versionNumber" must be a positive integer.',
    );
    return;
  }

  const workflowVersionStructure = await getWorkflowVersionStructureUseCase.execute(input);

  logger.info('Retrieved workflow version structure', {
    correlationId,
    operationName: 'handleGetWorkflowVersionStructureRequest',
    httpStatusCode: 200,
    httpPath: '/workflows/version-structure',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly workflowVersionStructure: typeof workflowVersionStructure;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        workflowVersionStructure,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
