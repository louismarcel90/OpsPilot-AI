import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppLogger } from '@opspilot/logger';

import type { WorkflowRunReadRepository } from '../../../application/repositories/workflow-run-read-repository.js';
import { createWorkflowRunRealtimeTopic } from '../../../domain/realtime/realtime-event-topic.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import type { InMemoryRealtimeEventHub } from '../../../infrastructure/realtime/in-memory-realtime-event-hub.js';
import {
  prepareSseConnection,
  registerSseHeartbeat,
} from '../../../infrastructure/realtime/sse-client-connection.js';

function resolveRunId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleWorkflowRunRealtimeEventsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  workflowRunReadRepository: WorkflowRunReadRepository,
  realtimeEventHub: InMemoryRealtimeEventHub,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleWorkflowRunRealtimeEventsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/realtime/events',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const workflowRun = await workflowRunReadRepository.findById(runId);

  if (workflowRun === null) {
    logger.warn('Workflow run was not found for realtime subscription', {
      correlationId,
      operationName: 'handleWorkflowRunRealtimeEventsRequest',
      httpStatusCode: 404,
      httpPath: '/workflow-runs/realtime/events',
    });

    writeBadRequestResponse(response, correlationId, 'Workflow run was not found.');
    return;
  }

  const subscriberId = randomUUID();
  const topic = createWorkflowRunRealtimeTopic(workflowRun.id);

  prepareSseConnection(response);

  realtimeEventHub.subscribe({
    subscriberId,
    topic,
    response,
  });

  logger.info('Subscribed to workflow run realtime events', {
    correlationId,
    operationName: 'handleWorkflowRunRealtimeEventsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/realtime/events',
  });

  registerSseHeartbeat({
    request,
    response,
    intervalMs: 15_000,
    onClose: () => {
      realtimeEventHub.unsubscribe({
        subscriberId,
        topic,
      });

      logger.info('Unsubscribed from workflow run realtime events', {
        correlationId,
        operationName: 'handleWorkflowRunRealtimeEventsRequest',
        httpStatusCode: 200,
        httpPath: '/workflow-runs/realtime/events',
      });
    },
  });
}
