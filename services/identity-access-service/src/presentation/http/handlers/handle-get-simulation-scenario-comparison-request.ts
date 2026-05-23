import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetSimulationScenarioComparisonUseCase } from '../../../application/use-cases/get-simulation-scenario-comparison.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleGetSimulationScenarioComparisonRequest(
  _request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getSimulationScenarioComparisonUseCase: GetSimulationScenarioComparisonUseCase,
): Promise<void> {
  const comparison = await getSimulationScenarioComparisonUseCase.execute();

  logger.info('Retrieved simulation scenario comparison', {
    correlationId,
    operationName: 'handleGetSimulationScenarioComparisonRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/scenarios/comparison',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly comparison: typeof comparison;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        comparison,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
