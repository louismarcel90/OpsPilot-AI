import type { ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { getHealthCheckResponse } from '../../../application/health/get-health-check-response.js';

function writeJsonResponse(response: ServerResponse, statusCode: number, payload: object): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function handleHealthRequest(
  response: ServerResponse,
  config: AppConfig,
  logger: AppLogger,
  correlationId: string,
): void {
  logger.info('Handling health check request', {
    correlationId,
    serviceName: config.serviceName,
    operationName: 'handleHealthRequest',
  });

  const payload = getHealthCheckResponse(config.serviceName);

  writeJsonResponse(response, 200, payload);
}
