import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunRealtimeStalenessUseCase } from '../../../application/use-cases/get-workflow-run-realtime-staleness.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

const DEFAULT_STALE_THRESHOLD_MS = 30_000;
const MIN_STALE_THRESHOLD_MS = 5_000;
const MAX_STALE_THRESHOLD_MS = 300_000;

function parseStaleThresholdMs(rawValue: string | null): number {
  if (rawValue === null || rawValue.trim().length === 0) {
    return DEFAULT_STALE_THRESHOLD_MS;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error('Query parameter "staleThresholdMs" must be a positive integer.');
  }

  return Math.min(Math.max(parsedValue, MIN_STALE_THRESHOLD_MS), MAX_STALE_THRESHOLD_MS);
}

function resolveInput(request: IncomingMessage): {
  readonly runId: string;
  readonly staleThresholdMs: number;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return {
    runId: runId.trim(),
    staleThresholdMs: parseStaleThresholdMs(url.searchParams.get('staleThresholdMs')),
  };
}

export async function handleGetWorkflowRunRealtimeStalenessRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunRealtimeStalenessUseCase: GetWorkflowRunRealtimeStalenessUseCase,
): Promise<void> {
  try {
    const input = resolveInput(request);

    if (input === null) {
      logger.warn('Missing required runId query parameter', {
        correlationId,
        operationName: 'handleGetWorkflowRunRealtimeStalenessRequest',
        httpStatusCode: 400,
        httpPath: '/workflow-runs/realtime/staleness',
      });

      writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
      return;
    }

    const realtimeStaleness = await getWorkflowRunRealtimeStalenessUseCase.execute(input);

    logger.info('Retrieved workflow run realtime staleness', {
      correlationId,
      operationName: 'handleGetWorkflowRunRealtimeStalenessRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/realtime/staleness',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly realtimeStaleness: typeof realtimeStaleness;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          realtimeStaleness,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Workflow run realtime staleness request failed.';

    logger.warn('Workflow run realtime staleness request failed', {
      correlationId,
      operationName: 'handleGetWorkflowRunRealtimeStalenessRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/realtime/staleness',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
