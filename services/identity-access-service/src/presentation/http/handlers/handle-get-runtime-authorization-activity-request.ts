import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetRuntimeAuthorizationActivityUseCase } from '../../../application/use-cases/get-runtime-authorization-activity.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleGetRuntimeAuthorizationActivityRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getRuntimeAuthorizationActivityUseCase: GetRuntimeAuthorizationActivityUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetRuntimeAuthorizationActivityRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/authorization-activity',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const authorizationActivity = await getRuntimeAuthorizationActivityUseCase.execute(runId);

  logger.info('Retrieved runtime authorization activity', {
    correlationId,
    operationName: 'handleGetRuntimeAuthorizationActivityRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/authorization-activity',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly authorizationActivity: typeof authorizationActivity;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        authorizationActivity,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
