import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { DrainWorkflowRunUseCase } from '../../../application/use-cases/drain-workflow-run.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import type { RuntimeProtectedActionGuard } from '../../../application/services/runtime-protected-action-guard.js';
import type { WorkflowRunReadRepository } from '../../../application/repositories/workflow-run-read-repository.js';
import { resolveRuntimeActorId } from './resolve-runtime-actor-id.js';

const DEFAULT_MAX_COMMANDS = 10;
const HARD_MAX_COMMANDS = 50;

function resolvePositiveInteger(value: string | null): number | null {
  if (value === null || value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function resolveInput(request: IncomingMessage): {
  readonly runId: string;
  readonly maxCommands: number;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const runId = url.searchParams.get('runId');
  const maxCommandsRaw = url.searchParams.get('maxCommands');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  const requestedMaxCommands = resolvePositiveInteger(maxCommandsRaw) ?? DEFAULT_MAX_COMMANDS;

  const maxCommands = Math.min(requestedMaxCommands, HARD_MAX_COMMANDS);

  return {
    runId: runId.trim(),
    maxCommands,
  };
}

export async function handleDrainWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  drainWorkflowRunUseCase: DrainWorkflowRunUseCase,
  workflowRunReadRepository: WorkflowRunReadRepository,
  runtimeProtectedActionGuard: RuntimeProtectedActionGuard,
): Promise<void> {
  const input = resolveInput(request);
  const actorId = resolveRuntimeActorId(request);

  if (input === null || actorId === null) {
    logger.warn('Query parameters "runId" and "actorId" are required.', {
      correlationId,
      operationName: 'handleDrainWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/drain',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "runId" and "actorId" are required.',
    );
    return;
  }

  try {
    const workflowRun = await workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found.');
    }

    await runtimeProtectedActionGuard.assertAllowed({
      actorId,
      workspaceId: workflowRun.workspaceId,
      workflowRunId: workflowRun.id,
      action: 'drain_workflow_run',
    });
    const drainResult = await drainWorkflowRunUseCase.execute(input);

    logger.info('Drained workflow run', {
      correlationId,
      operationName: 'handleDrainWorkflowRunRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/drain',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly drainResult: typeof drainResult;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          drainResult,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Workflow run drain failed.';

    logger.warn('Workflow run drain failed', {
      correlationId,
      operationName: 'handleDrainWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/drain',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
