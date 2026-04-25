import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { AdvanceWorkflowRunUseCase } from '../../../application/use-cases/advance-workflow-run.use-case.js';
import type { RuntimeProtectedActionGuard } from '../../../application/services/runtime-protected-action-guard.js';
import type { WorkflowRunReadRepository } from '../../../application/repositories/workflow-run-read-repository.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import { resolveRuntimeActorId } from './resolve-runtime-actor-id.js';

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
  workflowRunReadRepository: WorkflowRunReadRepository,
  runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
): Promise<void> {
  const runId = resolveRunId(request);
  const actorId = resolveRuntimeActorId(request);

  if (runId === null || actorId === null) {
    logger.warn('Missing required workflow advance query parameters', {
      correlationId,
      operationName: 'handleAdvanceWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/advance',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "runId" and "actorId" are required.',
    );
    return;
  }

  try {
    const workflowRun = await workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    await runtimeProtectedActionGuard.assertAllowed({
      actorId,
      workspaceId: workflowRun.workspaceId,
      workflowRunId: workflowRun.id,
      action: 'advance_workflow_run',
    });

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
