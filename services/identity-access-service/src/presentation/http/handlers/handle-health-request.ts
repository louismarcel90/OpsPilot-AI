import type { ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { getHealthCheckResponse } from '../../../application/health/get-health-check-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export function handleHealthRequest(
  response: ServerResponse,
  config: AppConfig,
  logger: AppLogger,
  correlationId: string,
): void {
  const payload = getHealthCheckResponse(config.serviceName);

  logger.info('Handling health check request', {
    correlationId,
    serviceName: config.serviceName,
    operationName: 'handleHealthRequest',
    httpStatusCode: payload.statusCode,
  });

  writeJson(response, payload);
}
