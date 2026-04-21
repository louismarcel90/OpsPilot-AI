import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { FailWorkflowRunUseCase } from '../../../application/use-cases/fail-workflow-run.use-case.js';
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

export async function handleFailWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  failWorkflowRunUseCase: FailWorkflowRunUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleFailWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/fail',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  try {
    const workflowRun = await failWorkflowRunUseCase.execute(runId);

    logger.info('Failed workflow run', {
      correlationId,
      operationName: 'handleFailWorkflowRunRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/fail',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly workflowRun: typeof workflowRun;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          workflowRun,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Workflow run fail transition failed.';

    logger.warn('Workflow run fail transition failed', {
      correlationId,
      operationName: 'handleFailWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/fail',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
