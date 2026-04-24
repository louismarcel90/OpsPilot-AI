import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunDiagnosticsUseCase } from '../../../application/use-cases/get-workflow-run-diagnostics.use-case.js';
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

export async function handleGetWorkflowRunDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunDiagnosticsUseCase: GetWorkflowRunDiagnosticsUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowRunDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/diagnostics',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const diagnostics = await getWorkflowRunDiagnosticsUseCase.execute(runId);

  logger.info('Retrieved workflow run diagnostics', {
    correlationId,
    operationName: 'handleGetWorkflowRunDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/diagnostics',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly diagnostics: typeof diagnostics;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        diagnostics,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
