import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetRuntimeAuthorizationDiagnosticsUseCase } from '../../../application/use-cases/get-runtime-authorization-diagnostics.use-case.js';
import {
  isWorkflowRuntimeProtectedAction,
  type WorkflowRuntimeProtectedAction,
} from '../../../domain/workflows/workflow-runtime-protected-action.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly actorId: string;
  readonly runId: string;
  readonly action: WorkflowRuntimeProtectedAction;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const actorId = url.searchParams.get('actorId');
  const runId = url.searchParams.get('runId');
  const actionRaw = url.searchParams.get('action');

  if (!actorId || actorId.trim().length === 0) {
    return null;
  }

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  if (!actionRaw || !isWorkflowRuntimeProtectedAction(actionRaw)) {
    return null;
  }

  return {
    actorId: actorId.trim(),
    runId: runId.trim(),
    action: actionRaw,
  };
}

export async function handleGetRuntimeAuthorizationDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getRuntimeAuthorizationDiagnosticsUseCase: GetRuntimeAuthorizationDiagnosticsUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid runtime authorization diagnostics query parameters', {
      correlationId,
      operationName: 'handleGetRuntimeAuthorizationDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/runtime-authorization',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "actorId", "runId", and valid "action" are required.',
    );
    return;
  }

  const authorizationDecision = await getRuntimeAuthorizationDiagnosticsUseCase.execute({
    actorId: input.actorId,
    workflowRunId: input.runId,
    action: input.action,
  });

  logger.info('Retrieved runtime authorization diagnostics', {
    correlationId,
    operationName: 'handleGetRuntimeAuthorizationDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/runtime-authorization',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly authorizationDecision: typeof authorizationDecision;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        authorizationDecision,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
