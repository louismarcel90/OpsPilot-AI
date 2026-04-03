import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';
import type { PostgresConnection } from '@opspilot/db';

import { createCorrelationId } from '@opspilot/observability';

import { handleHealthRequest } from '../../../presentation/http/handlers/handle-health-request.js';
import { handleRootRequest } from '../../../presentation/http/handlers/handle-root-request.js';
import { writeRouteNotFoundResponse } from '../responses/write-route-not-found-response.js';
import { writeUnexpectedErrorResponse } from '../responses/write-unexpected-error-response.js';

function resolvePath(request: IncomingMessage): string {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  return url.pathname;
}

export function createRouter(config: AppConfig, logger: AppLogger, connection: PostgresConnection) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const method = request.method ?? 'GET';
    const path = resolvePath(request);
    const correlationId = createCorrelationId();

    logger.info('Received HTTP request', {
      correlationId,
      serviceName: config.serviceName,
      operationName: 'routeDispatch',
      httpMethod: method,
      httpPath: path,
    });

    try {
      if (method === 'GET' && path === '/') {
        handleRootRequest(response, config, logger, correlationId);
        return;
      }

      if (method === 'GET' && path === '/health') {
        await handleHealthRequest(response, config, logger, correlationId, connection);
        return;
      }

      logger.warn('Route not found', {
        correlationId,
        serviceName: config.serviceName,
        operationName: 'routeNotFound',
        httpMethod: method,
        httpPath: path,
        httpStatusCode: 404,
      });

      writeRouteNotFoundResponse(response, correlationId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown unexpected error';

      logger.error('Unhandled route error', {
        correlationId,
        serviceName: config.serviceName,
        operationName: 'routeDispatch',
        httpMethod: method,
        httpPath: path,
        httpStatusCode: 500,
        errorMessage,
      });

      writeUnexpectedErrorResponse(response, correlationId);
    }
  };
}
