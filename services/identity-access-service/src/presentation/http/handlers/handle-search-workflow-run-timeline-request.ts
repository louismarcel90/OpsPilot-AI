import type { IncomingMessage, ServerResponse } from 'node:http';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import type { SearchWorkflowRunTimelineUseCase } from '../../../application/use-cases/search-workflow-run-timeline.use-case.js';
import type { WorkflowRuntimeEventType } from '../../../domain/workflows/workflow-runtime-event-type.js';
import type { WorkflowRuntimeEventCategory } from '../../../domain/workflows/workflow-runtime-event-category.js';

function parseList(value: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
}

export async function handleSearchWorkflowRunTimelineRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: SearchWorkflowRunTimelineUseCase,
) {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');

    const runId = url.searchParams.get('runId');

    if (!runId) {
      writeBadRequestResponse(response, correlationId, 'runId required');
      return;
    }

    const actorId = url.searchParams.get('actorId');
    const query = url.searchParams.get('query');

    const filter = {
      ...(actorId !== null ? { actorId } : {}),
      actions: parseList(url.searchParams.get('actions')),
      ...(query !== null ? { query } : {}),
      eventTypes: [] as WorkflowRuntimeEventType[],
      categories: [] as WorkflowRuntimeEventCategory[],
      limit: 100,
    };

    const result = await useCase.execute({
      runId,
      filter,
    });

    writeJson(response, {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: { result },
        correlationId,
      },
    });
  } catch {
    writeBadRequestResponse(response, correlationId, 'Invalid request');
  }
}
