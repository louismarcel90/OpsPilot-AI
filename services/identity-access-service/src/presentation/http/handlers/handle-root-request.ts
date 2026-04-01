import type { ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { createRootRouteResponse } from '../../../infrastructure/http/routes/create-root-route-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export function handleRootRequest(
  response: ServerResponse,
  config: AppConfig,
  logger: AppLogger,
  correlationId: string,
): void {
  const payload = createRootRouteResponse(config.serviceName, correlationId);

  logger.info('Handling root route request', {
    correlationId,
    serviceName: config.serviceName,
    operationName: 'handleRootRequest',
    httpStatusCode: payload.statusCode,
  });

  writeJson(response, payload);
}
