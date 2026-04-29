import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ListSimulationScenariosUseCase } from '../../../application/use-cases/list-simulation-scenarios.use-case.js';
import {
  isSimulationScenarioCategory,
  type SimulationScenarioCategory,
} from '../../../domain/simulation/simulation-scenario-category.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveCategory(request: IncomingMessage): SimulationScenarioCategory | undefined {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const category = url.searchParams.get('category');

  if (category === null || category.trim().length === 0) {
    return undefined;
  }

  if (!isSimulationScenarioCategory(category)) {
    throw new Error(`Invalid simulation scenario category: ${category}`);
  }

  return category;
}

export async function handleListSimulationScenariosRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  listSimulationScenariosUseCase: ListSimulationScenariosUseCase,
): Promise<void> {
  try {
    const category = resolveCategory(request);

    const scenarios = await listSimulationScenariosUseCase.execute({
      ...(category !== undefined ? { category } : {}),
    });

    logger.info('Listed simulation scenarios', {
      correlationId,
      operationName: 'handleListSimulationScenariosRequest',
      httpStatusCode: 200,
      httpPath: '/simulation/scenarios',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly scenarios: typeof scenarios;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          scenarios,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Simulation scenario listing failed.';

    logger.warn('Simulation scenario listing failed', {
      correlationId,
      operationName: 'handleListSimulationScenariosRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
