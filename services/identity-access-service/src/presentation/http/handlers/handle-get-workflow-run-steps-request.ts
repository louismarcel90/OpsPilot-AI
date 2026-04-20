import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunStepsUseCase } from '../../../application/use-cases/get-workflow-run-steps.use-case.js';
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

export async function handleGetWorkflowRunStepsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunStepsUseCase: GetWorkflowRunStepsUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowRunStepsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/steps',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const workflowRunSteps = await getWorkflowRunStepsUseCase.execute(runId);

  logger.info('Retrieved workflow run steps', {
    correlationId,
    operationName: 'handleGetWorkflowRunStepsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/steps',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly workflowRunSteps: typeof workflowRunSteps;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        workflowRunSteps,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
