import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import type { GetAuthorizationParityByCorrelationIdUseCase } from '../../../application/use-cases/get-authorization-parity-by-correlation-id.use-case.js';
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

export async function handleGetAuthorizationParityByCorrelationIdRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase,
  getAuthorizationParityByCorrelationIdUseCase: GetAuthorizationParityByCorrelationIdUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleGetAuthorizationParityByCorrelationIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/by-correlation-id',
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
    logger.warn('Authorization parity correlation lookup access denied', {
      correlationId,
      operationName: 'handleGetAuthorizationParityByCorrelationIdRequest',
      httpStatusCode: 403,
      httpPath: '/diagnostics/authorization-parity/by-correlation-id',
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
      operationName: 'handleGetAuthorizationParityByCorrelationIdRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/by-correlation-id',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameter "correlationId" is required.',
    );
    return;
  }

  const events = await getAuthorizationParityByCorrelationIdUseCase.execute(targetCorrelationId);

  logger.info('Retrieved authorization parity events by correlation id', {
    correlationId,
    operationName: 'handleGetAuthorizationParityByCorrelationIdRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/by-correlation-id',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly correlationId: string;
      readonly events: typeof events;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        correlationId: targetCorrelationId,
        events,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
