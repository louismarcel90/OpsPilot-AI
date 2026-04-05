import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { ApiSuccessContract } from '@opspilot/contracts';

import type { ResolveWorkspaceMembershipUseCase } from '../../../application/use-cases/resolve-workspace-membership.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

interface WorkspaceMembershipQuery {
  readonly workspaceId: string;
  readonly userId: string;
}

function resolveQuery(request: IncomingMessage): WorkspaceMembershipQuery | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const workspaceId = url.searchParams.get('workspaceId');
  const userId = url.searchParams.get('userId');

  if (!workspaceId || workspaceId.trim().length === 0) {
    return null;
  }

  if (!userId || userId.trim().length === 0) {
    return null;
  }

  return {
    workspaceId: workspaceId.trim(),
    userId: userId.trim(),
  };
}

export async function handleResolveWorkspaceMembershipRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: ResolveWorkspaceMembershipUseCase,
): Promise<void> {
  const query = resolveQuery(request);

  if (query === null) {
    logger.warn('Missing required query parameters', {
      correlationId,
      operationName: 'handleResolveWorkspaceMembershipRequest',
      httpStatusCode: 400,
      httpPath: '/workspace-memberships/resolve',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "workspaceId" and "userId" are required.',
    );
    return;
  }

  const membership = await useCase.execute(query);

  logger.info('Resolved workspace membership', {
    correlationId,
    operationName: 'handleResolveWorkspaceMembershipRequest',
    httpStatusCode: 200,
    httpPath: '/workspace-memberships/resolve',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly membership: typeof membership }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        membership,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
