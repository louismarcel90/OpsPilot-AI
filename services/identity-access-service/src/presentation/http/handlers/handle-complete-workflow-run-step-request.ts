import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { CompleteWorkflowRunStepUseCase } from '../../../application/use-cases/complete-workflow-run-step.use-case.js';
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

export async function handleCompleteWorkflowRunStepRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  completeWorkflowRunStepUseCase: CompleteWorkflowRunStepUseCase,
): Promise<void> {
  const runStepId = resolveRunStepId(request);

  if (runStepId === null) {
    logger.warn('Missing required runStepId query parameter', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunStepRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/steps/complete',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runStepId" is required.');
    return;
  }

  try {
    const workflowRunStep = await completeWorkflowRunStepUseCase.execute(runStepId);

    logger.info('Completed workflow run step', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunStepRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/steps/complete',
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
    const errorMessage =
      error instanceof Error ? error.message : 'Workflow run step completion failed.';

    logger.warn('Workflow run step completion failed', {
      correlationId,
      operationName: 'handleCompleteWorkflowRunStepRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/steps/complete',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
