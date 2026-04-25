import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowEngineDiagnosticsUseCase } from '../../../application/use-cases/get-workflow-engine-diagnostics.use-case.js';
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

export async function handleGetWorkflowEngineDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowEngineDiagnosticsUseCase: GetWorkflowEngineDiagnosticsUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowEngineDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/engine-diagnostics',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const engineDiagnostics = await getWorkflowEngineDiagnosticsUseCase.execute(runId);

  logger.info('Retrieved workflow engine diagnostics', {
    correlationId,
    operationName: 'handleGetWorkflowEngineDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/engine-diagnostics',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly engineDiagnostics: typeof engineDiagnostics;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        engineDiagnostics,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
