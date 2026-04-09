import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import type { GetAuthorizationParityHistoryUseCase } from '../../../application/use-cases/get-authorization-parity-history.use-case.js';
import type {
  AuthorizationAuditEventSource,
  AuthorizationAuditEventType,
} from '../../../domain/authorization/authorization-audit-event.js';
import type { AuthorizationAuditEventHistoryFilter } from '../../../domain/authorization/authorization-audit-event-history-filter.js';
import { extractRequestContext } from '../../../infrastructure/http/request-context/extract-request-context.js';
import { extractRequiredWorkspaceHeaders } from '../../../infrastructure/http/request-context/extract-required-workspace-headers.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

const AUTHORIZATION_AUDIT_EVENT_TYPES: readonly AuthorizationAuditEventType[] = [
  'workspace_access_check',
  'workspace_capability_check',
  'authorization_catalog_parity_check',
  'manual_revalidation_completed',
  'bootstrap_validation_completed',
] as const;

const AUTHORIZATION_AUDIT_EVENT_SOURCES: readonly AuthorizationAuditEventSource[] = [
  'bootstrap',
  'http_request',
  'background_process',
  'manual_revalidation',
] as const;

function isAuthorizationAuditEventType(value: string): value is AuthorizationAuditEventType {
  return AUTHORIZATION_AUDIT_EVENT_TYPES.includes(value as AuthorizationAuditEventType);
}

function isAuthorizationAuditEventSource(value: string): value is AuthorizationAuditEventSource {
  return AUTHORIZATION_AUDIT_EVENT_SOURCES.includes(value as AuthorizationAuditEventSource);
}

function resolveHistoryFilter(
  request: IncomingMessage,
): AuthorizationAuditEventHistoryFilter | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const limitValue = url.searchParams.get('limit');
  const eventTypeValue = url.searchParams.get('eventType');
  const sourceValue = url.searchParams.get('source');
  const correlationIdValue = url.searchParams.get('correlationId');
  const diagnosticIdValue = url.searchParams.get('diagnosticId');

  let limit = 20;

  if (limitValue !== null) {
    const parsedLimit = Number(limitValue);

    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      return null;
    }

    limit = Math.min(parsedLimit, 100);
  }

  let eventType: AuthorizationAuditEventType | undefined;
  if (eventTypeValue !== null) {
    const trimmedEventType = eventTypeValue.trim();

    if (!isAuthorizationAuditEventType(trimmedEventType)) {
      return null;
    }

    eventType = trimmedEventType;
  }

  let source: AuthorizationAuditEventSource | undefined;
  if (sourceValue !== null) {
    const trimmedSource = sourceValue.trim();

    if (!isAuthorizationAuditEventSource(trimmedSource)) {
      return null;
    }

    source = trimmedSource;
  }

  const correlationId =
    correlationIdValue !== null && correlationIdValue.trim().length > 0
      ? correlationIdValue.trim()
      : undefined;

  const diagnosticId =
    diagnosticIdValue !== null && diagnosticIdValue.trim().length > 0
      ? diagnosticIdValue.trim()
      : undefined;

  return {
    limit,
    ...(eventType !== undefined ? { eventType } : {}),
    ...(source !== undefined ? { source } : {}),
    ...(correlationId !== undefined ? { correlationId } : {}),
    ...(diagnosticId !== undefined ? { diagnosticId } : {}),
  };
}

export async function handleGetAuthorizationParityHistoryRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase,
  getAuthorizationParityHistoryUseCase: GetAuthorizationParityHistoryUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleGetAuthorizationParityHistoryRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/history',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Headers "x-actor-email", "x-tenant-slug", and "x-workspace-slug" are required.',
    );
    return;
  }

  const enforcementResult = await enforceProtectedWorkspaceRequestUseCase.execute(
    protectedRequest,
    'workspace.members.read',
  );

  if (enforcementResult.decision.status !== 'allowed') {
    logger.warn('Authorization parity history access denied', {
      correlationId,
      operationName: 'handleGetAuthorizationParityHistoryRequest',
      httpStatusCode: 403,
      httpPath: '/diagnostics/authorization-parity/history',
    });

    writeForbiddenResponse(
      response,
      correlationId,
      'The actor does not have the required workspace.members.read capability.',
    );
    return;
  }

  const historyFilter = resolveHistoryFilter(request);

  if (historyFilter === null) {
    logger.warn('Invalid authorization parity history query parameters', {
      correlationId,
      operationName: 'handleGetAuthorizationParityHistoryRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/history',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters are invalid. Supported filters are "limit", "eventType", "source", "correlationId", and "diagnosticId".',
    );
    return;
  }

  const events = await getAuthorizationParityHistoryUseCase.execute(historyFilter.limit);

  logger.info('Retrieved filtered authorization parity history', {
    correlationId,
    operationName: 'handleGetAuthorizationParityHistoryRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/history',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly events: typeof events;
      readonly filter: typeof historyFilter;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        events,
        filter: historyFilter,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
