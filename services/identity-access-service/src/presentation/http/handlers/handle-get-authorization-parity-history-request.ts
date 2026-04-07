import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import { extractRequestContext } from '../../../infrastructure/http/request-context/extract-request-context.js';
import { extractRequiredWorkspaceHeaders } from '../../../infrastructure/http/request-context/extract-required-workspace-headers.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';
import type { GetAuthorizationParityHistoryUseCase } from '../../../application/use-cases/get-authorization-parity-history.use-case.js';

function resolveLimit(request: IncomingMessage): number {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const limitValue = url.searchParams.get('limit');

  if (!limitValue) {
    return 20;
  }

  const parsedLimit = Number(limitValue);

  if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
    return 20;
  }

  return Math.min(parsedLimit, 100);
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

  const limit = resolveLimit(request);
  const events = await getAuthorizationParityHistoryUseCase.execute(limit);

  logger.info('Retrieved persisted authorization parity history', {
    correlationId,
    operationName: 'handleGetAuthorizationParityHistoryRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/history',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly events: typeof events;
      readonly limit: number;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        events,
        limit,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
