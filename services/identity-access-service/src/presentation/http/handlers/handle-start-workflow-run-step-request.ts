import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { StartWorkflowRunStepUseCase } from '../../../application/use-cases/start-workflow-run-step.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunStepId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runStepId = url.searchParams.get('runStepId');

  if (!runStepId || runStepId.trim().length === 0) {
    return null;
  }

  return runStepId.trim();
}

export async function handleStartWorkflowRunStepRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  startWorkflowRunStepUseCase: StartWorkflowRunStepUseCase,
): Promise<void> {
  const runStepId = resolveRunStepId(request);

  if (runStepId === null) {
    logger.warn('Missing required runStepId query parameter', {
      correlationId,
      operationName: 'handleStartWorkflowRunStepRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/steps/start',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runStepId" is required.');
    return;
  }

  try {
    const workflowRunStep = await startWorkflowRunStepUseCase.execute(runStepId);

    logger.info('Started workflow run step', {
      correlationId,
      operationName: 'handleStartWorkflowRunStepRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/steps/start',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly workflowRunStep: typeof workflowRunStep;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          workflowRunStep,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Workflow run step start failed.';

    logger.warn('Workflow run step start failed', {
      correlationId,
      operationName: 'handleStartWorkflowRunStepRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/steps/start',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
