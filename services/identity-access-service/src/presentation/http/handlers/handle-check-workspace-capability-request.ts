import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { CheckWorkspaceCapabilityUseCase } from '../../../application/use-cases/check-workspace-capability.use-case.js';
import {
  isWorkspaceScope,
  type WorkspaceScope,
} from '../../../domain/authorization/workspace-scope-catalog.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

interface CheckWorkspaceCapabilityQuery {
  readonly email: string;
  readonly tenantSlug: string;
  readonly workspaceSlug: string;
  readonly requiredScope: WorkspaceScope;
}

function resolveQuery(request: IncomingMessage): CheckWorkspaceCapabilityQuery | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const email = url.searchParams.get('email');
  const tenantSlug = url.searchParams.get('tenantSlug');
  const workspaceSlug = url.searchParams.get('workspaceSlug');
  const requiredScope = url.searchParams.get('requiredScope');

  if (!email || email.trim().length === 0) {
    return null;
  }

  if (!tenantSlug || tenantSlug.trim().length === 0) {
    return null;
  }

  if (!workspaceSlug || workspaceSlug.trim().length === 0) {
    return null;
  }

  if (!requiredScope || requiredScope.trim().length === 0) {
    return null;
  }

  const trimmedRequiredScope = requiredScope.trim();

  if (!isWorkspaceScope(trimmedRequiredScope)) {
    return null;
  }

  return {
    email: email.trim(),
    tenantSlug: tenantSlug.trim(),
    workspaceSlug: workspaceSlug.trim(),
    requiredScope: trimmedRequiredScope,
  };
}

export async function handleCheckWorkspaceCapabilityRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: CheckWorkspaceCapabilityUseCase,
): Promise<void> {
  const query = resolveQuery(request);

  if (query === null) {
    logger.warn('Missing or invalid required query parameters', {
      correlationId,
      operationName: 'handleCheckWorkspaceCapabilityRequest',
      httpStatusCode: 400,
      httpPath: '/workspace-capabilities/check',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "email", "tenantSlug", "workspaceSlug", and a valid "requiredScope" are required.',
    );
    return;
  }

  const decision = await useCase.execute(query);

  logger.info('Checked workspace capability', {
    correlationId,
    operationName: 'handleCheckWorkspaceCapabilityRequest',
    httpStatusCode: 200,
    httpPath: '/workspace-capabilities/check',
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
