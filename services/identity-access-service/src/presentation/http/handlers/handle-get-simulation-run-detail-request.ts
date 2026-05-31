import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetSimulationRunDetailUseCase } from '../../../application/use-cases/get-simulation-run-detail.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunId(request: IncomingMessage): string | null {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleGetSimulationRunDetailRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getSimulationRunDetailUseCase: GetSimulationRunDetailUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const run = await getSimulationRunDetailUseCase.execute(runId);

  logger.info('Retrieved simulation run detail', {
    correlationId,
    operationName: 'handleGetSimulationRunDetailRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/runs/detail',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly run: typeof run }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: { run },
      correlationId,
    },
  };

  writeJson(response, payload);
}
