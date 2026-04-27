import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunRealtimeDiagnosticsUseCase } from '../../../application/use-cases/get-workflow-run-realtime-diagnostics.use-case.js';
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

export async function handleGetWorkflowRunRealtimeDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunRealtimeDiagnosticsUseCase: GetWorkflowRunRealtimeDiagnosticsUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowRunRealtimeDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/realtime/diagnostics',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const realtimeDiagnostics = await getWorkflowRunRealtimeDiagnosticsUseCase.execute(runId);

  logger.info('Retrieved workflow run realtime diagnostics', {
    correlationId,
    operationName: 'handleGetWorkflowRunRealtimeDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/realtime/diagnostics',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly realtimeDiagnostics: typeof realtimeDiagnostics;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        realtimeDiagnostics,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
