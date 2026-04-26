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
import { handleGetWorkflowBySlugRequest } from '../../../presentation/http/handlers/handle-get-workflow-by-slug-request.js';
import { handleGetWorkflowVersionsRequest } from '../../../presentation/http/handlers/handle-get-workflow-versions-request.js';
import { handleGetWorkflowWithVersionsRequest } from '../../../presentation/http/handlers/handle-get-workflow-with-versions-request.js';
import { handleListWorkflowsRequest } from '../../../presentation/http/handlers/handle-list-workflows-request.js';
import { handleGetPublishedWorkflowVersionRequest } from '../../../presentation/http/handlers/handle-get-published-workflow-version-request.js';
import { handleGetWorkflowVersionConsistencyRequest } from '../../../presentation/http/handlers/handle-get-workflow-version-consistency-request.js';
import { handleGetWorkflowPublishReadinessRequest } from '../../../presentation/http/handlers/handle-get-workflow-publish-readiness-request.js';
import { handlePublishWorkflowVersionRequest } from '../../../presentation/http/handlers/handle-publish-workflow-version-request.js';
import { handleGetWorkflowLatestPublicationRequest } from '../../../presentation/http/handlers/handle-get-workflow-latest-publication-request.js';
import { handleGetWorkflowPublicationHistoryRequest } from '../../../presentation/http/handlers/handle-get-workflow-publication-history-request.js';
import { handleGetWorkflowVersionStepsRequest } from '../../../presentation/http/handlers/handle-get-workflow-version-steps-request.js';
import { handleGetWorkflowVersionStructureRequest } from '../../../presentation/http/handlers/handle-get-workflow-version-structure-request.js';
import { handleGetWorkflowStepConsistencyRequest } from '../../../presentation/http/handlers/handle-get-workflow-step-consistency-request.js';
import { handleGetWorkflowStepRegistryAlignmentRequest } from '../../../presentation/http/handlers/handle-get-workflow-step-registry-alignment-request.js';
import { handleCreateWorkflowRunRequest } from '../../../presentation/http/handlers/handle-create-workflow-run-request.js';
import { handleGetWorkflowRunStepsRequest } from '../../../presentation/http/handlers/handle-get-workflow-run-steps-request.js';
import { handleStartWorkflowRunRequest } from '../../../presentation/http/handlers/handle-start-workflow-run-request.js';
import { handleStartWorkflowRunStepRequest } from '../../../presentation/http/handlers/handle-start-workflow-run-step-request.js';
import { handleFailWorkflowRunStepRequest } from '../../../presentation/http/handlers/handle-fail-workflow-run-step-request.js';
import { handleCompleteWorkflowRunStepRequest } from '../../../presentation/http/handlers/handle-complete-workflow-run-step-request.js';
import { handleGetApprovalRequestsByWorkflowRunRequest } from '../../../presentation/http/handlers/handle-get-approval-requests-by-workflow-run-request.js';
import { handleApproveApprovalRequest } from '../../../presentation/http/handlers/handle-approve-approval-request.js';
import { handleRejectApprovalRequest } from '../../../presentation/http/handlers/handle-reject-approval-request.js';
import { handleGetWorkflowRunOperationalViewRequest } from '../../../presentation/http/handlers/handle-get-workflow-run-operational-view-request.js';
import { handleGetWorkflowRunTimelineRequest } from '../../../presentation/http/handlers/handle-get-workflow-run-timeline-request.js';
import { handleGetWorkflowRunDiagnosticsRequest } from '../../../presentation/http/handlers/handle-get-workflow-run-diagnostics-request.js';
import { handleAdvanceWorkflowRunRequest } from '../../../presentation/http/handlers/handle-advance-workflow-run-request.js';
import { handleDrainWorkflowRunRequest } from '../../../presentation/http/handlers/handle-drain-workflow-run-request.js';
import { handleGetWorkflowEngineDiagnosticsRequest } from '../../../presentation/http/handlers/handle-get-workflow-engine-diagnostics-request.js';
import { handleGetWorkflowRuntimeCommandPreviewRequest } from '../../../presentation/http/handlers/handle-get-workflow-runtime-command-preview-request.js';
import { handleGetWorkflowRuntimeProtectionDiagnosticsRequest } from '../../../presentation/http/handlers/handle-get-workflow-runtime-protection-diagnostics-request.js';
import { handleGetRuntimeAuthorizationDiagnosticsRequest } from '../../../presentation/http/handlers/handle-get-runtime-authorization-diagnostics-request.js';
import { handleGetDeniedRuntimeActionsRequest } from '../../../presentation/http/handlers/handle-get-denied-runtime-actions-request.js';

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

      if (method === 'GET' && path === '/workflows') {
        await handleListWorkflowsRequest(
          response,
          logger,
          correlationId,
          dependencies.listWorkflowsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/by-slug') {
        await handleGetWorkflowBySlugRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowBySlugUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/versions') {
        await handleGetWorkflowVersionsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowVersionsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/with-versions') {
        await handleGetWorkflowWithVersionsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowWithVersionsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/published-version') {
        await handleGetPublishedWorkflowVersionRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getPublishedWorkflowVersionUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/version-consistency') {
        await handleGetWorkflowVersionConsistencyRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowVersionConsistencyUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/publish-readiness') {
        await handleGetWorkflowPublishReadinessRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowPublishReadinessUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflows/publish') {
        await handlePublishWorkflowVersionRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.publishWorkflowVersionUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/publication-history') {
        await handleGetWorkflowPublicationHistoryRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowPublicationHistoryUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/latest-publication') {
        await handleGetWorkflowLatestPublicationRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowLatestPublicationUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/version-steps') {
        await handleGetWorkflowVersionStepsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowVersionStepsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/version-structure') {
        await handleGetWorkflowVersionStructureRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowVersionStructureUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/step-consistency') {
        await handleGetWorkflowStepConsistencyRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowStepConsistencyUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflows/step-registry-alignment') {
        await handleGetWorkflowStepRegistryAlignmentRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowStepRegistryAlignmentUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs') {
        await handleCreateWorkflowRunRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.createWorkflowRunUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/steps') {
        await handleGetWorkflowRunStepsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRunStepsUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs/start') {
        await handleStartWorkflowRunRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.startWorkflowRunUseCase,
        );
        return;
      }

      if (request.method === 'POST' && path === '/workflow-runs/steps/start') {
        await handleStartWorkflowRunStepRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.startWorkflowRunStepUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs/steps/complete') {
        await handleCompleteWorkflowRunStepRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.completeWorkflowRunStepUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs/steps/fail') {
        await handleFailWorkflowRunStepRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.failWorkflowRunStepUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/approval-requests') {
        await handleGetApprovalRequestsByWorkflowRunRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getApprovalRequestsByWorkflowRunUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/approval-requests/approve') {
        await handleApproveApprovalRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.approveApprovalRequestUseCase,
          dependencies.approvalRequestReadRepository,
          dependencies.runtimeProtectedActionGuard,
        );
        return;
      }
      if (method === 'POST' && path === '/approval-requests/reject') {
        await handleRejectApprovalRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.rejectApprovalRequestUseCase,
          dependencies.approvalRequestReadRepository,
          dependencies.runtimeProtectedActionGuard,
        );
        return;
      }
      if (method === 'GET' && path === '/workflow-runs/operational-view') {
        await handleGetWorkflowRunOperationalViewRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRunOperationalViewUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/timeline') {
        await handleGetWorkflowRunTimelineRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRunTimelineUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/diagnostics') {
        await handleGetWorkflowRunDiagnosticsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRunDiagnosticsUseCase,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs/advance') {
        await handleAdvanceWorkflowRunRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.advanceWorkflowRunUseCase,
          dependencies.workflowRunReadRepository,
          dependencies.runtimeProtectedActionGuard,
        );
        return;
      }

      if (method === 'POST' && path === '/workflow-runs/drain') {
        await handleDrainWorkflowRunRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.drainWorkflowRunUseCase,
          dependencies.workflowRunReadRepository,
          dependencies.runtimeProtectedActionGuard,
        );
        return;
      }
      if (method === 'GET' && path === '/workflow-runs/engine-diagnostics') {
        await handleGetWorkflowEngineDiagnosticsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowEngineDiagnosticsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/command-preview') {
        await handleGetWorkflowRuntimeCommandPreviewRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRuntimeCommandPreviewUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/protection-diagnostics') {
        await handleGetWorkflowRuntimeProtectionDiagnosticsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getWorkflowRuntimeProtectionDiagnosticsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/runtime-authorization') {
        await handleGetRuntimeAuthorizationDiagnosticsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getRuntimeAuthorizationDiagnosticsUseCase,
        );
        return;
      }

      if (method === 'GET' && path === '/workflow-runs/denied-actions') {
        await handleGetDeniedRuntimeActionsRequest(
          request,
          response,
          logger,
          correlationId,
          dependencies.getDeniedRuntimeActionsUseCase,
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
