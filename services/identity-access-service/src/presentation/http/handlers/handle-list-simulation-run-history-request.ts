import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ListSimulationRunHistoryUseCase } from '../../../application/use-cases/list-simulation-run-history.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleListSimulationRunHistoryRequest(
  _request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  listSimulationRunHistoryUseCase: ListSimulationRunHistoryUseCase,
): Promise<void> {
  const runs = await listSimulationRunHistoryUseCase.execute();

  logger.info('Listed simulation run history', {
    correlationId,
    operationName: 'handleListSimulationRunHistoryRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/runs/history',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly runs: typeof runs }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: { runs },
      correlationId,
    },
  };

  writeJson(response, payload);
}
