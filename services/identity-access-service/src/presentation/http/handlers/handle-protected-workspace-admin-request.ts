import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { EnforceProtectedWorkspaceScopeUseCase } from '../../../application/use-cases/enforce-protected-workspace-scope.use-case.js';
import { extractRequestActorContextHeaders } from '../../../infrastructure/http/request-context/extract-request-actor-context-headers.js';
import { writeForbiddenResponse } from '../../../infrastructure/http/responses/write-forbidden-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleProtectedWorkspaceAdminRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: EnforceProtectedWorkspaceScopeUseCase,
): Promise<void> {
  const headers = extractRequestActorContextHeaders(request);

  const decision = await useCase.execute({
    headers,
    requiredScope: 'workspace.admin',
  });

  if (decision.status !== 'allowed') {
    logger.warn('Protected route access denied', {
      correlationId,
      operationName: 'handleProtectedWorkspaceAdminRequest',
      httpStatusCode: 403,
      httpPath: '/protected/workspace-admin',
    });

    writeForbiddenResponse(response, correlationId, decision.message);
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
      readonly decision: typeof decision;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        message: 'Protected workspace admin route access granted.',
        decision,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
