import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { AdvanceWorkflowRunUseCase } from '../../../application/use-cases/advance-workflow-run.use-case.js';
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

export async function handleAdvanceWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  advanceWorkflowRunUseCase: AdvanceWorkflowRunUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleAdvanceWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/advance',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  try {
    const result = await advanceWorkflowRunUseCase.execute(runId);

    logger.info('Advanced workflow run', {
      correlationId,
      operationName: 'handleAdvanceWorkflowRunRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/advance',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly result: typeof result;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          result,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Workflow run advance failed.';

    logger.warn('Workflow run advance failed', {
      correlationId,
      operationName: 'handleAdvanceWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/advance',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
