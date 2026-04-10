import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import type { GetAuthorizationParityInvestigationByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-investigation-by-correlation-id.use-case.js';
import { extractRequestContext } from '../../../infrastructure/http/request-context/extract-request-context.js';
import { extractRequiredWorkspaceHeaders } from '../../../infrastructure/http/request-context/extract-required-workspace-headers.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveCorrelationId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const correlationId = url.searchParams.get('correlationId');

  if (!correlationId || correlationId.trim().length === 0) {
    return null;
  }

  return correlationId.trim();
}

export async function handleGetAuthorizationParityInvestigationByCorrelationIdRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase,
  getAuthorizationParityInvestigationByCorrelationIdUseCase: GetAuthorizationParityInvestigationByCorrelationIdUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleGetAuthorizationParityInvestigationByCorrelationIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/investigation/by-correlation-id',
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
    logger.warn('Authorization parity investigation by correlation id access denied', {
      correlationId,
      operationName: 'handleGetAuthorizationParityInvestigationByCorrelationIdRequest',
      httpStatusCode: 403,
      httpPath: '/diagnostics/authorization-parity/investigation/by-correlation-id',
    });

    writeForbiddenResponse(
      response,
      correlationId,
      'The actor does not have the required workspace.members.read capability.',
    );
    return;
  }

  const targetCorrelationId = resolveCorrelationId(request);

  if (targetCorrelationId === null) {
    logger.warn('Missing required correlationId query parameter', {
      correlationId,
      operationName: 'handleGetAuthorizationParityInvestigationByCorrelationIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/investigation/by-correlation-id',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "correlationId" is required.',
    );
    return;
  }

  const investigation =
    await getAuthorizationParityInvestigationByCorrelationIdUseCase.execute(targetCorrelationId);

  logger.info('Retrieved authorization parity investigation by correlation id', {
    correlationId,
    operationName: 'handleGetAuthorizationParityInvestigationByCorrelationIdRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/investigation/by-correlation-id',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly investigation: typeof investigation }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        investigation,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
