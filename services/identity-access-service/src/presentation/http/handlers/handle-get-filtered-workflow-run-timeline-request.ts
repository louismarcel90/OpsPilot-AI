import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetFilteredWorkflowRunTimelineUseCase } from '../../../application/use-cases/get-filtered-workflow-run-timeline.use-case.js';
import {
  WORKFLOW_RUNTIME_EVENT_CATEGORY_VALUES,
  type WorkflowRuntimeEventCategory,
} from '../../../domain/workflows/workflow-runtime-event-category.js';
import {
  isWorkflowRuntimeEventType,
  type WorkflowRuntimeEventType,
} from '../../../domain/workflows/workflow-runtime-event-type.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

const DEFAULT_TIMELINE_LIMIT = 100;
const HARD_TIMELINE_LIMIT = 500;

function isWorkflowRuntimeEventCategory(value: string): value is WorkflowRuntimeEventCategory {
  return WORKFLOW_RUNTIME_EVENT_CATEGORY_VALUES.includes(value as WorkflowRuntimeEventCategory);
}

function parseCommaSeparatedValues(rawValue: string | null): string[] {
  if (rawValue === null || rawValue.trim().length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

function parseEventTypes(rawValue: string | null): WorkflowRuntimeEventType[] {
  const rawEventTypes = parseCommaSeparatedValues(rawValue);
  const eventTypes: WorkflowRuntimeEventType[] = [];

  for (const rawEventType of rawEventTypes) {
    if (!isWorkflowRuntimeEventType(rawEventType)) {
      throw new Error(`Invalid workflow runtime event type: ${rawEventType}`);
    }

    eventTypes.push(rawEventType);
  }

  return eventTypes;
}

function parseCategories(rawValue: string | null): WorkflowRuntimeEventCategory[] {
  const rawCategories = parseCommaSeparatedValues(rawValue);
  const categories: WorkflowRuntimeEventCategory[] = [];

  for (const rawCategory of rawCategories) {
    if (!isWorkflowRuntimeEventCategory(rawCategory)) {
      throw new Error(`Invalid workflow runtime event category: ${rawCategory}`);
    }

    categories.push(rawCategory);
  }

  return categories;
}

function parseLimit(rawValue: string | null): number {
  if (rawValue === null || rawValue.trim().length === 0) {
    return DEFAULT_TIMELINE_LIMIT;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error('Query parameter "limit" must be a positive integer.');
  }

  return Math.min(parsedValue, HARD_TIMELINE_LIMIT);
}

function resolveInput(request: IncomingMessage): {
  readonly runId: string;
  readonly eventTypes: WorkflowRuntimeEventType[];
  readonly categories: WorkflowRuntimeEventCategory[];
  readonly limit: number;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return {
    runId: runId.trim(),
    eventTypes: parseEventTypes(url.searchParams.get('eventTypes')),
    categories: parseCategories(url.searchParams.get('categories')),
    limit: parseLimit(url.searchParams.get('limit')),
  };
}

export async function handleGetFilteredWorkflowRunTimelineRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getFilteredWorkflowRunTimelineUseCase: GetFilteredWorkflowRunTimelineUseCase,
): Promise<void> {
  try {
    const input = resolveInput(request);

    if (input === null) {
      logger.warn('Missing required filtered timeline query parameters', {
        correlationId,
        operationName: 'handleGetFilteredWorkflowRunTimelineRequest',
        httpStatusCode: 400,
        httpPath: '/workflow-runs/timeline/filtered',
      });

      writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
      return;
    }

    const filteredTimeline = await getFilteredWorkflowRunTimelineUseCase.execute(input);

    logger.info('Retrieved filtered workflow run timeline', {
      correlationId,
      operationName: 'handleGetFilteredWorkflowRunTimelineRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/timeline/filtered',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly filteredTimeline: typeof filteredTimeline;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          filteredTimeline,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Filtered workflow run timeline request failed.';

    logger.warn('Filtered workflow run timeline request failed', {
      correlationId,
      operationName: 'handleGetFilteredWorkflowRunTimelineRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/timeline/filtered',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
