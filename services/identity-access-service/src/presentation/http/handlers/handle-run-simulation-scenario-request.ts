import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ProtectedRunSimulationScenarioUseCase } from '../../../application/use-cases/protected-run-simulation-scenario.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly slug: string;
  readonly actorId: string;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const slug = url.searchParams.get('slug');
  const actorId = url.searchParams.get('actorId');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  if (!actorId || actorId.trim().length === 0) {
    return null;
  }

  return {
    slug: slug.trim(),
    actorId: actorId.trim(),
  };
}

export async function handleRunSimulationScenarioRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  protectedRunSimulationScenarioUseCase: ProtectedRunSimulationScenarioUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing required simulation run query parameters', {
      correlationId,
      operationName: 'handleRunSimulationScenarioRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios/run',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug" and "actorId" are required.',
    );
    return;
  }

  try {
    const simulationResult = await protectedRunSimulationScenarioUseCase.execute(input);

    logger.info('Ran protected simulation scenario', {
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

    logger.warn('Protected simulation scenario run failed', {
      correlationId,
      operationName: 'handleRunSimulationScenarioRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios/run',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
