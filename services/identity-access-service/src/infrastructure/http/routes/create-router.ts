import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { createCorrelationId } from '@opspilot/observability';

import { handleHealthRequest } from '../../../presentation/http/handlers/handle-health-request.js';
import { handleRootRequest } from '../../../presentation/http/handlers/handle-root-request.js';

function writeNotFoundResponse(response: ServerResponse, correlationId: string): void {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(
    JSON.stringify({
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested route does not exist.',
      correlationId,
    }),
  );
}

function resolvePath(request: IncomingMessage): string {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  return url.pathname;
}

export function createRouter(config: AppConfig, logger: AppLogger) {
  return (request: IncomingMessage, response: ServerResponse): void => {
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

    if (method === 'GET' && path === '/') {
      handleRootRequest(response, config, logger, correlationId);
      return;
    }

    if (method === 'GET' && path === '/health') {
      handleHealthRequest(response, config, logger, correlationId);
      return;
    }

    logger.warn('Route not found', {
      correlationId,
      serviceName: config.serviceName,
      operationName: 'routeNotFound',
      httpMethod: method,
      httpPath: path,
    });

    writeNotFoundResponse(response, correlationId);
  };
}
