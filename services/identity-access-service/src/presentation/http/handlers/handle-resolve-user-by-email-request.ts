import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { ApiSuccessContract } from '@opspilot/contracts';

import type { ResolveUserByEmailUseCase } from '../../../application/use-cases/resolve-user-by-email.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveEmail(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const email = url.searchParams.get('email');

  if (!email || email.trim().length === 0) {
    return null;
  }

  return email.trim();
}

export async function handleResolveUserByEmailRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: ResolveUserByEmailUseCase,
): Promise<void> {
  const email = resolveEmail(request);

  if (email === null) {
    logger.warn('Missing required query parameter', {
      correlationId,
      operationName: 'handleResolveUserByEmailRequest',
      httpStatusCode: 400,
      httpPath: '/users/by-email',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "email" is required.');
    return;
  }

  const user = await useCase.execute({ email });

  logger.info('Resolved user by email', {
    correlationId,
    operationName: 'handleResolveUserByEmailRequest',
    httpStatusCode: 200,
    httpPath: '/users/by-email',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly user: typeof user }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        user,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
