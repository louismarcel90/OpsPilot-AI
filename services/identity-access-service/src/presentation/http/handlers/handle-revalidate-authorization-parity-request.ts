import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { EnforceProtectedWorkspaceRequestUseCase } from '../../../application/use-cases/enforce-protected-workspace-request.use-case.js';
import type { RevalidateAuthorizationParityUseCase } from '../../../application/use-cases/revalidate-authorization-parity.use-case.js';
import { extractRequestContext } from '../../../infrastructure/http/request-context/extract-request-context.js';
import { extractRequiredWorkspaceHeaders } from '../../../infrastructure/http/request-context/extract-required-workspace-headers.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleRevalidateAuthorizationParityRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  enforceProtectedWorkspaceRequestUseCase: EnforceProtectedWorkspaceRequestUseCase,
  revalidateAuthorizationParityUseCase: RevalidateAuthorizationParityUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleRevalidateAuthorizationParityRequest',
      httpStatusCode: 400,
      httpPath: '/diagnostics/authorization-parity/revalidate',
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
    'workspace.admin',
  );

  if (enforcementResult.decision.status !== 'allowed') {
    logger.warn('Authorization parity revalidation access denied', {
      correlationId,
      operationName: 'handleRevalidateAuthorizationParityRequest',
      httpStatusCode: 403,
      httpPath: '/diagnostics/authorization-parity/revalidate',
    });

    writeForbiddenResponse(
      response,
      correlationId,
      'The actor does not have the required workspace.admin capability.',
    );
    return;
  }

  const diagnostic = await revalidateAuthorizationParityUseCase.execute({
    correlationId,
    requestId: correlationId,
  });

  logger.info('Revalidated authorization parity diagnostic', {
    correlationId,
    operationName: 'handleRevalidateAuthorizationParityRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/revalidate',
    diagnosticId: diagnostic.diagnosticId,
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly diagnostic: typeof diagnostic }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        diagnostic,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
