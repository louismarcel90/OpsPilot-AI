import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { DrainWorkflowRunUseCase } from '../../../application/use-cases/drain-workflow-run.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

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
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid workflow drain query parameters', {
      correlationId,
      operationName: 'handleDrainWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/drain',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  try {
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
