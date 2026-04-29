import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetSimulationScenarioDetailUseCase } from './get-simulation-scenario-detail.use-case.js';
import { writeJson } from '../../infrastructure/http/responses/write-json.js';
import { writeBadRequestResponse } from '../../infrastructure/http/responses/write-bad-request-response.js';

function resolveSlug(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const slug = url.searchParams.get('slug');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  return slug.trim();
}

export async function handleGetSimulationScenarioDetailRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getSimulationScenarioDetailUseCase: GetSimulationScenarioDetailUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required simulation scenario slug query parameter', {
      correlationId,
      operationName: 'handleGetSimulationScenarioDetailRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/scenarios/detail',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const scenarioDetail = await getSimulationScenarioDetailUseCase.execute(slug);

  logger.info('Retrieved simulation scenario detail', {
    correlationId,
    operationName: 'handleGetSimulationScenarioDetailRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/scenarios/detail',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly scenarioDetail: typeof scenarioDetail;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        scenarioDetail,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
