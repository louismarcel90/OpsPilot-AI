import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { CompleteWorkflowRunUseCase } from '../../../application/use-cases/complete-workflow-run.use-case.js';
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

export async function handleCompleteWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  completeWorkflowRunUseCase: CompleteWorkflowRunUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/complete',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  try {
    const workflowRun = await completeWorkflowRunUseCase.execute(runId);

    logger.info('Completed workflow run', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/complete',
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
    const errorMessage = error instanceof Error ? error.message : 'Workflow run completion failed.';

    logger.warn('Workflow run completion failed', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/complete',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
