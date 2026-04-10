import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import type { GetAuthorizationParityTimelineByDiagnosticIdUseCase } from '../../../application/use-cases/get-authorization-parity-timeline-by-diagnostic-id.use-case.js';
import { extractRequestContext } from '../../../infrastructure/http/request-context/extract-request-context.js';
import { extractRequiredWorkspaceHeaders } from '../../../infrastructure/http/request-context/extract-required-workspace-headers.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveDiagnosticId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const diagnosticId = url.searchParams.get('diagnosticId');

  if (!diagnosticId || diagnosticId.trim().length === 0) {
    return null;
  }

  return diagnosticId.trim();
}

export async function handleGetAuthorizationParityTimelineByDiagnosticIdRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase,
  getAuthorizationParityTimelineByDiagnosticIdUseCase: GetAuthorizationParityTimelineByDiagnosticIdUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleGetAuthorizationParityTimelineByDiagnosticIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/timeline/by-diagnostic-id',
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
    logger.warn('Authorization parity timeline by diagnostic id access denied', {
      correlationId,
      operationName: 'handleGetAuthorizationParityTimelineByDiagnosticIdRequest',
      httpStatusCode: 403,
      httpPath: '/diagnostics/authorization-parity/timeline/by-diagnostic-id',
    });

    writeForbiddenResponse(
      response,
      correlationId,
      'The actor does not have the required workspace.members.read capability.',
    );
    return;
  }

  const diagnosticId = resolveDiagnosticId(request);

  if (diagnosticId === null) {
    logger.warn('Missing required diagnosticId query parameter', {
      correlationId,
      operationName: 'handleGetAuthorizationParityTimelineByDiagnosticIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/timeline/by-diagnostic-id',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "diagnosticId" is required.');
    return;
  }

  const timelineView =
    await getAuthorizationParityTimelineByDiagnosticIdUseCase.execute(diagnosticId);

  logger.info('Retrieved authorization parity timeline by diagnostic id', {
    correlationId,
    operationName: 'handleGetAuthorizationParityTimelineByDiagnosticIdRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/timeline/by-diagnostic-id',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly timelineView: typeof timelineView }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        timelineView,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
