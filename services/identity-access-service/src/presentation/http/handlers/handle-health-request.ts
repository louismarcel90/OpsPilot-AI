import type { ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';
import type { PostgresConnection } from '@opspilot/db';

import { getHealthCheckResponse } from '../../../application/health/get-health-check-response.js';
import { checkDatabaseHealth } from '../../../infrastructure/db/health/check-database-health.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import { writeUnexpectedErrorResponse } from '../../../infrastructure/http/responses/write-unexpected-error-response.js';

export async function handleHealthRequest(
  response: ServerResponse,
  config: AppConfig,
  logger: AppLogger,
  correlationId: string,
  connection: PostgresConnection,
): Promise<void> {
  try {
    const databaseIsHealthy = await checkDatabaseHealth(connection);
    const payload = getHealthCheckResponse(config.serviceName, databaseIsHealthy);

    logger.info('Handling health check request', {
      correlationId,
      serviceName: config.serviceName,
      operationName: 'handleHealthRequest',
      httpStatusCode: payload.statusCode,
    });

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown unexpected error';

    logger.error('Health check failed', {
      correlationId,
      serviceName: config.serviceName,
      operationName: 'handleHealthRequest',
      httpStatusCode: 500,
      errorMessage,
    });

    writeUnexpectedErrorResponse(response, correlationId);
  }
}
