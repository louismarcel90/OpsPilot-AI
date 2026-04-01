import type { ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { createRootRouteResponse } from '../../../infrastructure/http/routes/create-root-route-response.js';

function writeJsonResponse(response: ServerResponse, statusCode: number, payload: object): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function handleRootRequest(
  response: ServerResponse,
  config: AppConfig,
  logger: AppLogger,
  correlationId: string,
): void {
  logger.info('Handling root route request', {
    correlationId,
    serviceName: config.serviceName,
    operationName: 'handleRootRequest',
  });

  const payload = createRootRouteResponse(config.serviceName, correlationId);

  writeJsonResponse(response, 200, payload);
}
