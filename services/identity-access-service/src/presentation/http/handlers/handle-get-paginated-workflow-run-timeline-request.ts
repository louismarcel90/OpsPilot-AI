import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetPaginatedWorkflowRunTimelineUseCase } from '../../../application/use-cases/get-paginated-workflow-run-timeline.use-case.js';
import type { WorkflowRuntimeTimelineCursor } from '../../../domain/workflows/workflow-runtime-timeline-cursor.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import { decodeWorkflowRuntimeTimelineCursor } from '../../../infrastructure/workflows/workflow-runtime-timeline-cursor-codec.js';

const DEFAULT_TIMELINE_PAGE_LIMIT = 25;
const HARD_TIMELINE_PAGE_LIMIT = 100;

function parseLimit(rawValue: string | null): number {
  if (rawValue === null || rawValue.trim().length === 0) {
    return DEFAULT_TIMELINE_PAGE_LIMIT;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error('Query parameter "limit" must be a positive integer.');
  }

  return Math.min(parsedValue, HARD_TIMELINE_PAGE_LIMIT);
}

function parseCursor(rawValue: string | null): WorkflowRuntimeTimelineCursor | null {
  if (rawValue === null || rawValue.trim().length === 0) {
    return null;
  }

  return decodeWorkflowRuntimeTimelineCursor(rawValue.trim());
}

function resolveInput(request: IncomingMessage): {
  readonly runId: string;
  readonly limit: number;
  readonly cursor: WorkflowRuntimeTimelineCursor | null;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return {
    runId: runId.trim(),
    limit: parseLimit(url.searchParams.get('limit')),
    cursor: parseCursor(url.searchParams.get('cursor')),
  };
}

export async function handleGetPaginatedWorkflowRunTimelineRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getPaginatedWorkflowRunTimelineUseCase: GetPaginatedWorkflowRunTimelineUseCase,
): Promise<void> {
  try {
    const input = resolveInput(request);

    if (input === null) {
      logger.warn('Missing required paginated timeline query parameters', {
        correlationId,
        operationName: 'handleGetPaginatedWorkflowRunTimelineRequest',
        httpStatusCode: 400,
        httpPath: '/workflow-runs/timeline/page',
      });

      writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
      return;
    }

    const timelinePage = await getPaginatedWorkflowRunTimelineUseCase.execute(input);

    logger.info('Retrieved paginated workflow run timeline', {
      correlationId,
      operationName: 'handleGetPaginatedWorkflowRunTimelineRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/timeline/page',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly timelinePage: typeof timelinePage;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          timelinePage,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Paginated workflow run timeline request failed.';

    logger.warn('Paginated workflow run timeline request failed', {
      correlationId,
      operationName: 'handleGetPaginatedWorkflowRunTimelineRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/timeline/page',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
