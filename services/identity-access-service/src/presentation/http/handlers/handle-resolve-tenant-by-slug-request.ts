import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { ApiSuccessContract } from '@opspilot/contracts';

import type { ResolveTenantBySlugUseCase } from '../../../application/use-cases/resolve-tenant-by-slug.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveSlug(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const slug = url.searchParams.get('slug');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  return slug.trim();
}

export async function handleResolveTenantBySlugRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: ResolveTenantBySlugUseCase,
): Promise<void> {
  const slug = resolveSlug(request);

  if (slug === null) {
    logger.warn('Missing required query parameter', {
      correlationId,
      operationName: 'handleResolveTenantBySlugRequest',
      httpStatusCode: 400,
      httpPath: '/tenants/by-slug',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "slug" is required.');
    return;
  }

  const tenant = await useCase.execute({ slug });

  logger.info('Resolved tenant by slug', {
    correlationId,
    operationName: 'handleResolveTenantBySlugRequest',
    httpStatusCode: 200,
    httpPath: '/tenants/by-slug',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly tenant: typeof tenant }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        tenant,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
