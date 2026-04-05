import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { WorkspaceRoleCode } from '../../../domain/authorization/role-catalog.js';
import { isWorkspaceRoleCode } from '../../../domain/authorization/role-catalog.js';
import type { CheckWorkspaceAccessUseCase } from '../../../application/use-cases/check-workspace-access.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

interface CheckWorkspaceAccessQuery {
  readonly email: string;
  readonly tenantSlug: string;
  readonly workspaceSlug: string;
  readonly requiredRole: WorkspaceRoleCode;
}

function resolveQuery(request: IncomingMessage): CheckWorkspaceAccessQuery | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const email = url.searchParams.get('email');
  const tenantSlug = url.searchParams.get('tenantSlug');
  const workspaceSlug = url.searchParams.get('workspaceSlug');
  const requiredRole = url.searchParams.get('requiredRole');

  if (!email || email.trim().length === 0) {
    return null;
  }

  if (!tenantSlug || tenantSlug.trim().length === 0) {
    return null;
  }

  if (!workspaceSlug || workspaceSlug.trim().length === 0) {
    return null;
  }

  if (!requiredRole || requiredRole.trim().length === 0) {
    return null;
  }

  const trimmedRequiredRole = requiredRole.trim();

  if (!isWorkspaceRoleCode(trimmedRequiredRole)) {
    return null;
  }

  return {
    email: email.trim(),
    tenantSlug: tenantSlug.trim(),
    workspaceSlug: workspaceSlug.trim(),
    requiredRole: trimmedRequiredRole,
  };
}

export async function handleCheckWorkspaceAccessRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: CheckWorkspaceAccessUseCase,
): Promise<void> {
  const query = resolveQuery(request);

  if (query === null) {
    logger.warn('Missing or invalid required query parameters', {
      correlationId,
      operationName: 'handleCheckWorkspaceAccessRequest',
      httpStatusCode: 400,
      httpPath: '/workspace-access/check',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "email", "tenantSlug", "workspaceSlug", and a valid "requiredRole" are required.',
    );
    return;
  }

  const decision = await useCase.execute(query);

  logger.info('Checked workspace access', {
    correlationId,
    operationName: 'handleCheckWorkspaceAccessRequest',
    httpStatusCode: 200,
    httpPath: '/workspace-access/check',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly decision: typeof decision }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        decision,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
