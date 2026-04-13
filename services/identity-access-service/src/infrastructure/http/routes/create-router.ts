import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { PostgresConnection } from '@opspilot/db';
import type { AppLogger } from '@opspilot/logger';
import { createCorrelationId } from '@opspilot/observability';

import { handleCheckWorkspaceAccessRequest } from '../../../presentation/http/handlers/handle-check-workspace-access-request.js';
import { handleCheckWorkspaceCapabilityRequest } from '../../../presentation/http/handlers/handle-check-workspace-capability-request.js';
import { handleHealthRequest } from '../../../presentation/http/handlers/handle-health-request.js';
import { handleProtectedWorkspaceAdminRequest } from '../../../presentation/http/handlers/handle-protected-workspace-admin-request.js';
import { handleResolveAccessContextRequest } from '../../../presentation/http/handlers/handle-resolve-access-context-request.js';
import { handleResolveTenantBySlugRequest } from '../../../presentation/http/handlers/handle-resolve-tenant-by-slug-request.js';
import { handleResolveUserByEmailRequest } from '../../../presentation/http/handlers/handle-resolve-user-by-email-request.js';
import { handleResolveWorkspaceMembershipRequest } from '../../../presentation/http/handlers/handle-resolve-workspace-membership-request.js';
import { handleRootRequest } from '../../../presentation/http/handlers/handle-root-request.js';
import { writeRouteNotFoundResponse } from '../responses/write-route-not-found-response.js';
import { writeUnexpectedErrorResponse } from '../responses/write-unexpected-error-response.js';
import type { ServiceDependencies } from '../runtime/service-dependencies.js';
import { handleGetWorkspaceAuthorizationCatalogRequest } from '../../../presentation/http/handlers/handle-get-workspace-authorization-catalog-request.js';
import { handleGetAuthorizationParityHistoryRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-history-request.js';
import { handleRevalidateAuthorizationParityRequest } from '../../../presentation/http/handlers/handle-revalidate-authorization-parity-request.js';
import { handleGetAuthorizationParityByCorrelationIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-by-correlation-id-request.js';
import { handleGetAuthorizationParityByDiagnosticIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-by-diagnostic-id-request.js';
import { handleGetAuthorizationParityInvestigationByCorrelationIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-investigation-by-correlation-id-request.js';
import { handleGetAuthorizationParityInvestigationByDiagnosticIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-investigation-by-diagnostic-id-request.js';
import { handleGetAuthorizationParityTimelineByCorrelationIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-timeline-by-correlation-id-request.js';
import { handleGetAuthorizationParityTimelineByDiagnosticIdRequest } from '../../../presentation/http/handlers/handle-get-authorization-parity-timeline-by-diagnostic-id-request.js';
import { handleGetAssistantBySlugRequest } from '../../../presentation/http/handlers/handle-get-assistant-by-slug-request.js';
import { handleGetAssistantVersionsRequest } from '../../../presentation/http/handlers/handle-get-assistant-versions-request.js';
import { handleListAssistantsRequest } from '../../../presentation/http/handlers/handle-list-assistants-request.js';
import { handleGetAssistantWithVersionsRequest } from '../../../presentation/http/handlers/handle-get-assistant-with-versions-request.js';
import { handleGetPublishedAssistantVersionRequest } from '../../../presentation/http/handlers/handle-get-published-assistant-version-request.js';
import { handleGetAssistantVersionConsistencyRequest } from '../../../presentation/http/handlers/handle-get-assistant-version-consistency-request.js';
import { handleGetAssistantPublishReadinessRequest } from '../../../presentation/http/handlers/handle-get-assistant-publish-readiness-request.js';
import { handlePublishAssistantVersionRequest } from '../../../presentation/http/handlers/handle-publish-assistant-version-request.js';
import { handleGetAssistantLatestPublicationRequest } from '../../../presentation/http/handlers/handle-get-assistant-latest-publication-request.js';
import { handleGetAssistantPublicationHistoryRequest } from '../../../presentation/http/handlers/handle-get-assistant-publication-history-request.js';

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

      if (method === 'GET' && path === '/access-context/resolve') {
        await handleResolveAccessContextRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.resolveAccessContextUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workspace-access/check') {
        await handleCheckWorkspaceAccessRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.checkWorkspaceAccessUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workspace-capabilities/check') {
        await handleCheckWorkspaceCapabilityRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.checkWorkspaceCapabilityUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/protected/workspace-admin') {
        await handleProtectedWorkspaceAdminRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/authorization/workspace-catalog') {
        await handleGetWorkspaceAuthorizationCatalogRequest(
          response,
          logger,
          correlationId,
          dependencies.getWorkspaceAuthorizationCatalogUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/diagnostics/authorization-parity/history') {
        await handleGetAuthorizationParityHistoryRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityHistoryUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/diagnostics/authorization-parity/revalidate') {
        await handleRevalidateAuthorizationParityRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.revalidateAuthorizationParityUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/diagnostics/authorization-parity/by-diagnostic-id') {
        await handleGetAuthorizationParityByDiagnosticIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityByDiagnosticIdUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/diagnostics/authorization-parity/by-correlation-id') {
        await handleGetAuthorizationParityByCorrelationIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityByCorrelationIdUseCase,
        );
        return;
      }

      if (
        method === 'GET' &&
        path === '/diagnostics/authorization-parity/investigation/by-diagnostic-id'
      ) {
        await handleGetAuthorizationParityInvestigationByDiagnosticIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityInvestigationByDiagnosticIdUseCase,
        );
        return;
      }

      if (
        method === 'GET' &&
        path === '/diagnostics/authorization-parity/investigation/by-correlation-id'
      ) {
        await handleGetAuthorizationParityInvestigationByCorrelationIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityInvestigationByCorrelationIdUseCase,
        );
        return;
      }

      if (
        method === 'GET' &&
        path === '/diagnostics/authorization-parity/timeline/by-diagnostic-id'
      ) {
        await handleGetAuthorizationParityTimelineByDiagnosticIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityTimelineByDiagnosticIdUseCase,
        );
        return;
      }

      if (
        method === 'GET' &&
        path === '/diagnostics/authorization-parity/timeline/by-correlation-id'
      ) {
        await handleGetAuthorizationParityTimelineByCorrelationIdRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.enforceProtectedWorkspaceRequestUseCase,
          dependencies.getAuthorizationParityTimelineByCorrelationIdUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants') {
        await handleListAssistantsRequest(
          response,
          logger,
          correlationId,
          dependencies.listAssistantsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/by-slug') {
        await handleGetAssistantBySlugRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantBySlugUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/versions') {
        await handleGetAssistantVersionsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantVersionsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/with-versions') {
        await handleGetAssistantWithVersionsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantWithVersionsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/published-version') {
        await handleGetPublishedAssistantVersionRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getPublishedAssistantVersionUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/version-consistency') {
        await handleGetAssistantVersionConsistencyRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantVersionConsistencyUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/publish-readiness') {
        await handleGetAssistantPublishReadinessRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantPublishReadinessUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/assistants/publish') {
        await handlePublishAssistantVersionRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.publishAssistantVersionUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/publication-history') {
        await handleGetAssistantPublicationHistoryRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantPublicationHistoryUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/assistants/latest-publication') {
        await handleGetAssistantLatestPublicationRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getAssistantLatestPublicationUseCase,
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
