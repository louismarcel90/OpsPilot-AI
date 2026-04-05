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

export async function handleProtectedWorkspaceAdminRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: EnforceProtectedWorkspaceRequestUseCase,
): Promise<void> {
  const requestContext = extractRequestContext(request, correlationId);
  const protectedRequest = extractRequiredWorkspaceHeaders(requestContext);

  if (protectedRequest === null) {
    logger.warn('Missing required protected route headers', {
      correlationId,
      operationName: 'handleProtectedWorkspaceAdminRequest',
      httpStatusCode: 400,
      httpPath: '/protected/workspace-admin',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Headers "x-actor-email", "x-tenant-slug", and "x-workspace-slug" are required.',
    );
    return;
  }

  const result = await useCase.execute(protectedRequest, 'workspace.admin');

  if (result.decision.status !== 'allowed') {
    logger.warn('Protected route access denied', {
      correlationId,
      operationName: 'handleProtectedWorkspaceAdminRequest',
      httpStatusCode: 403,
      httpPath: '/protected/workspace-admin',
    });

    writeForbiddenResponse(
      response,
      correlationId,
      'The actor does not have the required workspace.admin capability.',
    );
    return;
  }

  logger.info('Protected route access granted', {
    correlationId,
    operationName: 'handleProtectedWorkspaceAdminRequest',
    httpStatusCode: 200,
    httpPath: '/protected/workspace-admin',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly message: string;
      readonly actorEmail: string;
      readonly tenantSlug: string;
      readonly workspaceSlug: string;
      readonly grantedScope: 'workspace.admin';
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        message: 'Protected workspace admin route access granted.',
        actorEmail: protectedRequest.actorEmail,
        tenantSlug: protectedRequest.tenantSlug,
        workspaceSlug: protectedRequest.workspaceSlug,
        grantedScope: 'workspace.admin',
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
