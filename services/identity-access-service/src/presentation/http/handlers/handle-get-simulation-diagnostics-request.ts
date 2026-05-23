import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetSimulationDiagnosticsUseCase } from '../../../application/use-cases/get-simulation-diagnostics.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleGetSimulationDiagnosticsRequest(
  _request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getSimulationDiagnosticsUseCase: GetSimulationDiagnosticsUseCase,
): Promise<void> {
  const diagnostics = await getSimulationDiagnosticsUseCase.execute();

  logger.info('Retrieved simulation diagnostics', {
    correlationId,
    operationName: 'handleGetSimulationDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/diagnostics',
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
