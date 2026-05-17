import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { RunSimulationScenarioUseCase } from '../../../application/use-cases/run-simulation-scenario.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveSlug(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const slug = url.searchParams.get('slug');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  return slug.trim();
}

export async function handleRunSimulationScenarioRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  runSimulationScenarioUseCase: RunSimulationScenarioUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required simulation scenario slug query parameter', {
      correlationId,
      operationName: 'handleRunSimulationScenarioRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios/run',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  try {
    const simulationResult = await runSimulationScenarioUseCase.execute({ slug });

    logger.info('Ran simulation scenario', {
      correlationId,
      operationName: 'handleRunSimulationScenarioRequest',
      httpStatusCode: 200,
      httpPath: '/simulation/scenarios/run',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly simulationResult: typeof simulationResult;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          simulationResult,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Simulation scenario run failed.';

    logger.warn('Simulation scenario run failed', {
      correlationId,
      operationName: 'handleRunSimulationScenarioRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios/run',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
