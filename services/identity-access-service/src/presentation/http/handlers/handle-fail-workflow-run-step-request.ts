import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { FailWorkflowRunStepUseCase } from '../../../application/use-cases/fail-workflow-run-step.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunStepId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runStepId = url.searchParams.get('runStepId');

  if (runStepId === null || runStepId.trim().length === 0) {
    return null;
  }

  return runStepId.trim();
}

export async function handleFailWorkflowRunStepRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  failWorkflowRunStepUseCase: FailWorkflowRunStepUseCase,
): Promise<void> {
  const runStepId = resolveRunStepId(request);

  if (runStepId === null) {
    logger.warn('Missing required runStepId query parameter', {
      correlationId,
      operationName: 'handleFailWorkflowRunStepRequest',
      httpStatusCode: HTTP_STATUS_CODE.badRequest,
      httpPath: '/workflow-runs/steps/fail',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runStepId" is required.');
    return;
  }

  try {
    const workflowRunStep = await failWorkflowRunStepUseCase.execute(runStepId);

    logger.info('Failed workflow run step', {
      correlationId,
      operationName: 'handleFailWorkflowRunStepRequest',
      httpStatusCode: HTTP_STATUS_CODE.ok,
      httpPath: '/workflow-runs/steps/fail',
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
      error instanceof Error ? error.message : 'Workflow run step failure failed.';

    logger.warn('Workflow run step failure failed', {
      correlationId,
      operationName: 'handleFailWorkflowRunStepRequest',
      httpStatusCode: HTTP_STATUS_CODE.badRequest,
      httpPath: '/workflow-runs/steps/fail',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
