import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetDeniedRuntimeActionsUseCase } from '../../../application/use-cases/get-denied-runtime-actions.use-case.js';
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

export async function handleGetDeniedRuntimeActionsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getDeniedRuntimeActionsUseCase: GetDeniedRuntimeActionsUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetDeniedRuntimeActionsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/denied-actions',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const deniedRuntimeActions = await getDeniedRuntimeActionsUseCase.execute(runId);

  logger.info('Retrieved denied runtime actions', {
    correlationId,
    operationName: 'handleGetDeniedRuntimeActionsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/denied-actions',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly deniedRuntimeActions: typeof deniedRuntimeActions;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        deniedRuntimeActions,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
