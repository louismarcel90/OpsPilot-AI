import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunRealtimeSnapshotUseCase } from '../../../application/use-cases/get-workflow-run-realtime-snapshot.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleGetWorkflowRunRealtimeSnapshotRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunRealtimeSnapshotUseCase: GetWorkflowRunRealtimeSnapshotUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowRunRealtimeSnapshotRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/realtime/snapshot',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const realtimeSnapshot = await getWorkflowRunRealtimeSnapshotUseCase.execute(runId);

  logger.info('Retrieved workflow run realtime snapshot', {
    correlationId,
    operationName: 'handleGetWorkflowRunRealtimeSnapshotRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/realtime/snapshot',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly realtimeSnapshot: typeof realtimeSnapshot;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        realtimeSnapshot,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
