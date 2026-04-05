import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';
import type { PostgresConnection } from '@opspilot/db';

import { createCorrelationId } from '@opspilot/observability';

import type { ServiceDependencies } from '../runtime/service-dependencies.js';
import { handleHealthRequest } from '../../../presentation/http/handlers/handle-health-request.js';
import { handleResolveTenantBySlugRequest } from '../../../presentation/http/handlers/handle-resolve-tenant-by-slug-request.js';
import { handleResolveUserByEmailRequest } from '../../../presentation/http/handlers/handle-resolve-user-by-email-request.js';
import { handleResolveWorkspaceMembershipRequest } from '../../../presentation/http/handlers/handle-resolve-workspace-membership-request.js';
import { handleRootRequest } from '../../../presentation/http/handlers/handle-root-request.js';
import { writeRouteNotFoundResponse } from '../responses/write-route-not-found-response.js';
import { writeUnexpectedErrorResponse } from '../responses/write-unexpected-error-response.js';

function resolvePath(request: IncomingMessage): string {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  return url.pathname;
}

export function createRouter(
  config: AppConfig,
  logger: AppLogger,
  connection: PostgresConnection,
  dependencies: ServiceDependencies,
) {
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

      if (method === 'GET' && path === '/users/by-email') {
        await handleResolveUserByEmailRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.resolveUserByEmailUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/tenants/by-slug') {
        await handleResolveTenantBySlugRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.resolveTenantBySlugUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workspace-memberships/resolve') {
        await handleResolveWorkspaceMembershipRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.resolveWorkspaceMembershipUseCase,
        );
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
