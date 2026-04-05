import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { ResolveAccessContextUseCase } from '../../../application/use-cases/resolve-access-context.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

interface ResolveAccessContextQuery {
  readonly email: string;
  readonly tenantSlug: string;
  readonly workspaceSlug: string;
}

function resolveQuery(request: IncomingMessage): ResolveAccessContextQuery | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const email = url.searchParams.get('email');
  const tenantSlug = url.searchParams.get('tenantSlug');
  const workspaceSlug = url.searchParams.get('workspaceSlug');

  if (!email || email.trim().length === 0) {
    return null;
  }

  if (!tenantSlug || tenantSlug.trim().length === 0) {
    return null;
  }

  if (!workspaceSlug || workspaceSlug.trim().length === 0) {
    return null;
  }

  return {
    email: email.trim(),
    tenantSlug: tenantSlug.trim(),
    workspaceSlug: workspaceSlug.trim(),
  };
}

export async function handleResolveAccessContextRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: ResolveAccessContextUseCase,
): Promise<void> {
  const query = resolveQuery(request);

  if (query === null) {
    logger.warn('Missing required query parameters', {
      correlationId,
      operationName: 'handleResolveAccessContextRequest',
      httpStatusCode: 400,
      httpPath: '/access-context/resolve',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "email", "tenantSlug", and "workspaceSlug" are required.',
    );
    return;
  }

  const accessContext = await useCase.execute(query);

  logger.info('Resolved access context', {
    correlationId,
    operationName: 'handleResolveAccessContextRequest',
    httpStatusCode: 200,
    httpPath: '/access-context/resolve',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly accessContext: typeof accessContext }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        accessContext,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
